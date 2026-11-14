import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore, getAdminStorage } from "@/lib/firebase/admin";
import { getEditorialMediaConfig, requireEditorialStorageEnabled, requireEditorialStorageReadable } from "@/lib/media/config";
import { convertHeicToJpeg,validateEditorialImage } from "@/lib/media/image-validation";
import { EDITORIAL_MEDIA_MAX_DIMENSION,EDITORIAL_MEDIA_MAX_PIXELS,editorialVideoMimeSchema,mediaMetadataInputSchema,mediaPatchSchema,mediaSlideshowSchema,type EditorialMediaRecord,type EditorialVideoRecord,type MediaDerivative } from "@/lib/media/schemas";
import { decodeAndProcessImage } from "@/lib/media/processing";
import type { MediaItem } from "@/types/admin";

const collection = () => getAdminFirestore().collection("media");
const references = () => getAdminFirestore().collection("mediaReferences");
export const isEditorialStorageEmulator = () => getEditorialMediaConfig().mode === "emulator";
export const getEditorialStorageMode = () => getEditorialMediaConfig().mode;
const displaySize = (n:number) => n < 1048576 ? `${Math.round(n/1024)} KB` : `${(n/1048576).toFixed(1)} MB`;
const displayDate = (value:unknown) => value instanceof Timestamp ? value.toDate().toISOString() : new Date(String(value ?? 0)).toISOString();
const extensions: Record<string,string> = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/heic":"heic", "image/heif":"heif", "video/mp4":"mp4", "video/quicktime":"mov" };
const derivativePath = (id:string, version:string, variant:string) => `editorial/public/derivatives/${id}/${version}/${variant}.webp`;
const originalPath = (id:string, version:string, mimeType:string) => `editorial/private/originals/${id}/${version}/source.${extensions[mimeType]}`;
const pendingPath = (id:string, token:string) => `editorial/private/pending/${id}/${token}.upload`;

function toItem(id:string,data:FirebaseFirestore.DocumentData,projects:Map<string,{title:string;category:string}>):MediaItem {
  const projectId=typeof data.projectId==="string"?data.projectId:undefined,project=projectId?projects.get(projectId):undefined;
  const kind=data.kind==="editorial-video"?"video":"image";
  const type=data.mimeType==="image/jpeg"?"JPG":data.mimeType==="image/png"?"PNG":data.mimeType==="image/webp"?"WEBP":["image/heic","image/heif"].includes(data.mimeType)?"HEIC":data.mimeType==="video/quicktime"?"MOV":"MP4";
  const slideshow=mediaSlideshowSchema.safeParse(data.slideshow);
  return {id,name:String(data.originalName??"media"),src:`/api/admin/media/${id}/file`,kind,type,size:displaySize(Number(data.sizeBytes??0)),sizeBytes:Number(data.sizeBytes??0),width:Number(data.width??0),height:Number(data.height??0),durationSeconds:data.durationSeconds??null,posterSrc:data.posterMediaId?`/api/admin/media/${data.posterMediaId}/file`:null,alt:String(data.alt??""),caption:String(data.caption??""),status:data.status??"Failed",projectId,project:project?.title,roles:Array.isArray(data.roles)?data.roles:["general"],category:data.category??project?.category??"Combined",isCover:false,createdAt:displayDate(data.createdAt),crop:data.crop??null,slideshow:slideshow.success?slideshow.data:null,galleryPublished:data.galleryPublished===true,galleryExcluded:data.galleryExcluded===true,galleryOrder:Number.isInteger(data.galleryOrder)?data.galleryOrder:0};
}

export async function listAdminMedia(){const db=getAdminFirestore(),[media,projects]=await Promise.all([collection().orderBy("createdAt","desc").get(),db.collection("projects").get()]),projectMap=new Map(projects.docs.map(doc=>[doc.id,{title:String(doc.data().title??""),category:String(doc.data().category??"Combined")}])) ;return media.docs.flatMap(doc=>["editorial-image","editorial-video"].includes(doc.data().kind)&&doc.data().status!=="Deleted"?[toItem(doc.id,doc.data(),projectMap)]:[])}
export async function getMediaRecord(id:string){const snapshot=await collection().doc(id).get();return snapshot.exists?snapshot.data() as EditorialMediaRecord|EditorialVideoRecord:null}

async function enforceDailyLimit(uid:string, limit:number) {
  const snapshot = await collection().where("createdBy", "==", uid).get();
  const cutoff = Date.now() - 86_400_000;
  if (snapshot.docs.filter((doc) => doc.data().createdAt instanceof Timestamp && doc.data().createdAt.toMillis() >= cutoff).length >= limit) throw new Error("MEDIA_QUOTA_EXCEEDED");
}

export async function uploadEditorialMedia(input:{bytes:Uint8Array;mimeType:string;originalName:string;metadata:unknown},uid:string){
  const config=requireEditorialStorageEnabled(),metadata=mediaMetadataInputSchema.parse(input.metadata);
  await enforceDailyLimit(uid,config.dailyAdminLimit);
  if(editorialVideoMimeSchema.safeParse(input.mimeType).success)return uploadEditorialVideo(input,metadata,uid,config.maxVideoBytes);
  const ref=collection().doc(),version=`v${Date.now().toString(36)}`,token=randomUUID(),temporaryPath=pendingPath(ref.id,token),temporary=getAdminStorage().bucket().file(temporaryPath);
  await ref.create({schemaVersion:2,kind:"editorial-image",status:"Pending",...metadata,originalName:input.originalName.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,180),storagePath:"",mimeType:input.mimeType,sizeBytes:input.bytes.length,width:0,height:0,pixelCount:0,checksum:"",version,derivatives:[],failureCode:null,temporaryPath,createdAt:FieldValue.serverTimestamp(),createdBy:uid,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
  const written:string[]=[];
  try{
    if(!input.bytes.length||input.bytes.length>config.maxBytes)throw new Error("MEDIA_SIZE_INVALID");
    await temporary.save(Buffer.from(input.bytes),{resumable:false,metadata:{contentType:"application/octet-stream",cacheControl:"private, max-age=0, no-store",metadata:{mediaId:ref.id,kind:"editorial-pending"}}});written.push(temporaryPath);
    await ref.update({status:"Processing",updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
    const image=await validateEditorialImage({...input,maxBytes:config.maxBytes,maxPixels:config.maxPixels,maxDimension:config.maxDimension,version});
    const storagePath=originalPath(ref.id,version,image.mimeType),original=getAdminStorage().bucket().file(storagePath),sourceChecksum=createHash("sha256").update(image.privateOriginal).digest("hex");
    await original.save(Buffer.from(image.privateOriginal),{resumable:false,metadata:{contentType:image.mimeType,cacheControl:"private, max-age=0, no-store",metadata:{mediaId:ref.id,kind:"editorial-private-original",checksum:sourceChecksum}}});written.push(storagePath);
    const derivatives:MediaDerivative[]=[];
    for(const derivative of image.derivatives){const path=derivativePath(ref.id,version,derivative.descriptor.variant);await getAdminStorage().bucket().file(path).save(derivative.bytes,{resumable:false,metadata:{contentType:"image/webp",cacheControl:"public, max-age=31536000, immutable",metadata:{mediaId:ref.id,kind:"editorial-public-derivative",checksum:derivative.descriptor.checksum,version}}});written.push(path);derivatives.push({...derivative.descriptor,storagePath:path})}
    await ref.update({status:"Ready",originalName:image.originalName,storagePath,mimeType:image.mimeType,sizeBytes:image.sizeBytes,width:image.width,height:image.height,pixelCount:image.pixelCount,checksum:sourceChecksum,derivatives,temporaryPath:null,failureCode:null,readyAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
    await temporary.delete({ignoreNotFound:true});
    return ref.id;
  }catch(error){
    await Promise.all(written.map(path=>getAdminStorage().bucket().file(path).delete({ignoreNotFound:true}).catch(()=>undefined)));
    const failureCode=error instanceof Error&&error.message.startsWith("MEDIA_")?error.message:"MEDIA_PROCESSING_FAILED";
    await ref.update({status:"Failed",failureCode,temporaryPath:null,cleanupAfter:Timestamp.fromMillis(Date.now()+86400000),updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
    throw error instanceof Error?error:new Error("MEDIA_PROCESSING_FAILED");
  }
}

async function uploadEditorialVideo(input:{bytes:Uint8Array;mimeType:string;originalName:string},metadata:ReturnType<typeof mediaMetadataInputSchema.parse>,uid:string,maxBytes:number){
  if(!input.bytes.length||input.bytes.length>maxBytes)throw new Error("MEDIA_SIZE_INVALID");
  if(input.bytes.length<12||Buffer.from(input.bytes.slice(4,8)).toString("ascii")!=="ftyp")throw new Error("MEDIA_SIGNATURE_INVALID");
  const mimeType=editorialVideoMimeSchema.parse(input.mimeType),checksum=createHash("sha256").update(input.bytes).digest("hex");
  const duplicate=await collection().where("checksum","==",checksum).where("status","==","Ready").limit(1).get();
  if(!duplicate.empty)throw new Error("MEDIA_DUPLICATE");
  const ref=collection().doc(),version=`v${Date.now().toString(36)}`,storagePath=originalPath(ref.id,version,mimeType);
  await ref.create({schemaVersion:2,kind:"editorial-video",status:"Processing",...metadata,originalName:input.originalName.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,180),storagePath:"",mimeType,sizeBytes:input.bytes.length,width:0,height:0,durationSeconds:null,checksum,version,derivatives:[],posterMediaId:null,failureCode:null,createdAt:FieldValue.serverTimestamp(),createdBy:uid,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
  try{await getAdminStorage().bucket().file(storagePath).save(Buffer.from(input.bytes),{resumable:true,metadata:{contentType:mimeType,cacheControl:"private, max-age=0, no-store",metadata:{mediaId:ref.id,kind:"editorial-private-video",checksum}}});await ref.update({status:"Ready",storagePath,readyAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});return ref.id}catch(error){await getAdminStorage().bucket().file(storagePath).delete({ignoreNotFound:true}).catch(()=>undefined);await ref.update({status:"Failed",failureCode:"MEDIA_PROCESSING_FAILED",updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});throw error}
}

export async function updateMediaMetadata(id:string,input:unknown,uid:string){
  const value=mediaPatchSchema.parse(input),ref=collection().doc(id),snapshot=await ref.get();
  if(!snapshot.exists||snapshot.data()?.status==="Deleted")throw new Error("MEDIA_NOT_FOUND");
  if(value.galleryPublished===true&&snapshot.data()?.status!=="Ready")throw new Error("MEDIA_NOT_READY");
  if(value.crop!==undefined){
    requireEditorialStorageEnabled();const current=snapshot.data() as EditorialMediaRecord;
    if(current.kind!=="editorial-image"||current.status!=="Ready")throw new Error("MEDIA_NOT_READY");
    const [original]=await getAdminStorage().bucket().file(current.storagePath).download(),version=`v${Date.now().toString(36)}`,isHeic=current.mimeType==="image/heic"||current.mimeType==="image/heif",processBytes=isHeic?await convertHeicToJpeg(original):original,processMime:"image/jpeg"|"image/png"|"image/webp"=isHeic?"image/jpeg":current.mimeType as "image/jpeg"|"image/png"|"image/webp";
    const processed=await decodeAndProcessImage({bytes:processBytes,mimeType:processMime,maxPixels:EDITORIAL_MEDIA_MAX_PIXELS,maxDimension:EDITORIAL_MEDIA_MAX_DIMENSION,version,crop:value.crop});
    const derivatives:MediaDerivative[]=[];
    for(const derivative of processed.derivatives){const path=derivativePath(id,version,derivative.descriptor.variant);await getAdminStorage().bucket().file(path).save(derivative.bytes,{resumable:false,metadata:{contentType:"image/webp",cacheControl:"public, max-age=31536000, immutable",metadata:{mediaId:id,kind:"editorial-public-derivative",checksum:derivative.descriptor.checksum,version}}});derivatives.push({...derivative.descriptor,storagePath:path})}
    await ref.update({...value,version,derivatives,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
    await Promise.all(current.derivatives.map(item=>getAdminStorage().bucket().file(item.storagePath).delete({ignoreNotFound:true}).catch(()=>undefined)));return;
  }
  await ref.update({...value,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
}

const includesId=(value:unknown,id:string):boolean=>value===id||(Array.isArray(value)&&value.some(item=>includesId(item,id)))||(Boolean(value)&&typeof value==="object"&&Object.values(value as Record<string,unknown>).some(item=>includesId(item,id)));
export async function findMediaReferences(id:string){const reverse=await references().doc(id).get();if(reverse.exists)return Array.isArray(reverse.data()?.references)?reverse.data()!.references:[];const db=getAdminFirestore(),sources=["projects","resources","siteContent","services","businessSettings","featuredContent"],snapshots=await Promise.all(sources.map(name=>db.collection(name).get()));return snapshots.flatMap((snapshot,index)=>snapshot.docs.filter(doc=>includesId(doc.data(),id)).map(doc=>`${sources[index]}/${doc.id}`))}

export async function deleteEditorialMedia(id:string,uid="system"){
  requireEditorialStorageEnabled();const db=getAdminFirestore(),ref=collection().doc(id);let paths:string[]=[];
  await db.runTransaction(async transaction=>{const snapshot=await transaction.get(ref),reverse=await transaction.get(references().doc(id));if(!snapshot.exists||snapshot.data()?.status==="Deleted")throw new Error("MEDIA_NOT_FOUND");if(snapshot.data()?.slideshow||snapshot.data()?.galleryPublished===true)throw new Error("MEDIA_IN_USE");const refs=Array.isArray(reverse.data()?.references)?reverse.data()!.references:[];if(refs.length)throw new Error("MEDIA_IN_USE");const legacyRefs=reverse.exists?[]:await findMediaReferences(id);if(legacyRefs.length)throw new Error("MEDIA_IN_USE");const data=snapshot.data()!;paths=[String(data.storagePath??""),...(Array.isArray(data.derivatives)?data.derivatives.map((item:{storagePath?:string})=>String(item.storagePath??"")):[])].filter(Boolean);transaction.update(ref,{status:"Deleting",deleteRequestedAt:FieldValue.serverTimestamp(),deleteRequestedBy:uid,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid})});
  try{await Promise.all(paths.map(path=>getAdminStorage().bucket().file(path).delete({ignoreNotFound:true})));await ref.update({status:"Deleted",storagePath:null,derivatives:[],deletedAt:FieldValue.serverTimestamp(),deletedBy:uid,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid})}catch{await ref.update({status:"Failed",failureCode:"DELETE_FAILED",updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});throw new Error("MEDIA_DELETE_FAILED")}
}

export async function readEditorialMedia(id:string){requireEditorialStorageReadable();const record=await getMediaRecord(id);if(!record||record.status!=="Ready")throw new Error("MEDIA_NOT_FOUND");const [bytes]=await getAdminStorage().bucket().file(record.storagePath).download();return{bytes,mimeType:record.mimeType}}
export async function readEditorialDerivative(id:string,variant:"sm"|"md"|"lg"){requireEditorialStorageReadable();const record=await getMediaRecord(id),derivative=record?.kind==="editorial-image"?record.derivatives.find(item=>item.variant===variant):null;if(!record||record.status!=="Ready"||!derivative)throw new Error("MEDIA_NOT_FOUND");const [bytes]=await getAdminStorage().bucket().file(derivative.storagePath).download();return{bytes,mimeType:derivative.mimeType,etag:`\"${derivative.checksum}\"`,version:derivative.version}}

export async function cleanupAbandonedMedia(before=new Date(Date.now()-86400000)){requireEditorialStorageEnabled();const snapshot=await collection().where("status","in",["Pending","Processing","Failed"]).get();let removed=0;for(const doc of snapshot.docs){const data=doc.data(),updated=data.updatedAt instanceof Timestamp?data.updatedAt.toDate():new Date(0);if(updated>before)continue;const paths=[data.temporaryPath,data.storagePath,...(Array.isArray(data.derivatives)?data.derivatives.map((item:{storagePath?:string})=>item.storagePath):[])].filter(Boolean);await Promise.all(paths.map((path:string)=>getAdminStorage().bucket().file(path).delete({ignoreNotFound:true}).catch(()=>undefined)));await doc.ref.update({status:"Deleted",storagePath:null,derivatives:[],deletedAt:FieldValue.serverTimestamp(),deletedBy:"cleanup",updatedAt:FieldValue.serverTimestamp(),updatedBy:"cleanup"});removed++}return removed}
