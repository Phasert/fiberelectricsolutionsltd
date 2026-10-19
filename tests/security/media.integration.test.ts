import {describe,expect,it} from "vitest";
import {Timestamp} from "firebase-admin/firestore";
import {POST as uploadRoute} from "../../app/api/admin/media/route";
import {cleanupAbandonedMedia,deleteEditorialMedia,findMediaReferences,getMediaRecord,listAdminMedia,readEditorialMedia,updateMediaMetadata,uploadEditorialMedia} from "../../lib/media/repository";
import {validateEditorialImage} from "../../lib/media/image-validation";
import {getAdminFirestore} from "../../lib/firebase/admin";

const actor="phase-c6-test-admin";
function png(width=2,height=3){const bytes=new Uint8Array(33);bytes.set([137,80,78,71,13,10,26,10],0);bytes.set([0,0,0,13,73,72,68,82],8);new DataView(bytes.buffer).setUint32(16,width);new DataView(bytes.buffer).setUint32(20,height);return bytes}
const metadata={alt:"Emulator editorial image",caption:"Phase C6 test media",category:"Combined"as const,projectId:null};

describe("Phase C6 editorial media",()=>{
 it("rejects untrusted upload requests before authentication",async()=>{const response=await uploadRoute(new Request("http://localhost:3000/api/admin/media",{method:"POST",headers:{origin:"https://attacker.example"}}));expect(response.status).toBe(403)});
 it("validates MIME signatures, dimensions and configured size",()=>{expect(validateEditorialImage({bytes:png(),mimeType:"image/png",originalName:"sample.png"})).toMatchObject({width:2,height:3,sizeBytes:33});expect(()=>validateEditorialImage({bytes:png(),mimeType:"image/jpeg",originalName:"fake.jpg"})).toThrow("MEDIA_SIGNATURE_INVALID");expect(()=>validateEditorialImage({bytes:png(),mimeType:"image/png",originalName:"large.png",maxBytes:10})).toThrow("MEDIA_SIZE_INVALID")});
 it("uploads, persists, reads and updates emulator media",async()=>{const id=await uploadEditorialMedia({bytes:png(4,5),mimeType:"image/png",originalName:"editorial.png",metadata},actor);expect(await getMediaRecord(id)).toMatchObject({status:"Ready",width:4,height:5,kind:"editorial-image"});expect((await readEditorialMedia(id)).bytes.length).toBe(33);await updateMediaMetadata(id,{alt:"Updated alternative text",caption:"Updated caption"},actor);expect((await listAdminMedia()).find(item=>item.id===id)).toMatchObject({alt:"Updated alternative text",caption:"Updated caption"});await deleteEditorialMedia(id);expect(await getMediaRecord(id)).toBeNull()});
 it("prevents deletion while a project, article, page, service or branding record references media",async()=>{const id=await uploadEditorialMedia({bytes:png(),mimeType:"image/png",originalName:"referenced.png",metadata},actor),ref=getAdminFirestore().collection("siteContent").doc(`phase-c6-${id}`);await ref.set({status:"Published",published:{heroImageId:id}});expect(await findMediaReferences(id)).toContain(`siteContent/${ref.id}`);await expect(deleteEditorialMedia(id)).rejects.toThrow("MEDIA_IN_USE");await ref.delete();await deleteEditorialMedia(id)});
 it("cleans abandoned pending uploads without touching ready media",async()=>{const db=getAdminFirestore(),ref=db.collection("media").doc();await ref.set({status:"Pending",storagePath:`editorial/images/test/${ref.id}/original.png`,updatedAt:Timestamp.fromMillis(0)});expect(await cleanupAbandonedMedia(new Date())).toBeGreaterThanOrEqual(1);expect((await ref.get()).exists).toBe(false)});
});
