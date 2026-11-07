import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const archive=resolve(process.argv[2]??"");
const projectName=(process.argv[3]??"Tommy's Brentwood").trim();
if(!archive||!projectName)throw new Error("Usage: bun scripts/prepare-project-import.mjs <archive.zip> [project name]");
if((await stat(archive)).size===0)throw new Error("Archive is empty.");
const work=await mkdtemp(join(tmpdir(),"fes-project-import-"));
const slug=projectName.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const output=resolve("media-imports",slug,"manifest.json");
const supported=new Map([[".jpg","image/jpeg"],[".jpeg","image/jpeg"],[".png","image/png"],[".webp","image/webp"],[".mp4","video/mp4"],[".mov","video/quicktime"]]);
const convertible=new Map([[".heic","image/heic"],[".heif","image/heif"]]);

async function walk(directory){const entries=await readdir(directory,{withFileTypes:true});const files=[];for(const entry of entries){const path=join(directory,entry.name);if(entry.isDirectory())files.push(...await walk(path));else if(entry.isFile())files.push(path)}return files}
try{
  const extracted=spawnSync("tar",["-xf",archive,"-C",work],{stdio:"inherit"});
  if(extracted.status!==0)throw new Error("Unable to extract archive with the system tar utility.");
  const files=(await walk(work)).sort((a,b)=>relative(work,a).localeCompare(relative(work,b),undefined,{numeric:true}));
  const imageStems=new Set(files.filter(path=>[...supported.keys(),...convertible.keys()].includes(extname(path).toLowerCase())&&!supported.get(extname(path).toLowerCase())?.startsWith("video/")).map(path=>{const extension=extname(path);return basename(path).slice(0,-extension.length).toLowerCase()}));
  const seen=new Map(),items=[];
  for(const [order,path] of files.entries()){
    const bytes=await readFile(path),extension=extname(path).toLowerCase(),checksum=createHash("sha256").update(bytes).digest("hex"),duplicateOf=seen.get(checksum)??null;
    if(!duplicateOf)seen.set(checksum,relative(work,path));
    const mimeType=supported.get(extension)??convertible.get(extension)??null,isVideo=mimeType?.startsWith("video/")??false;
    const validContainer=!isVideo||bytes.length>=12&&bytes.subarray(4,8).toString("ascii")==="ftyp";
    const status=duplicateOf?"duplicate":!mimeType?"unsupported":convertible.has(extension)?"requires-conversion":validContainer?"ready-for-admin-upload":"invalid-container";
    const livePhotoMotionComponent=isVideo&&imageStems.has(basename(path).slice(0,-extension.length).toLowerCase());
    items.push({order,path:relative(work,path).replaceAll("\\","/"),name:basename(path),extension,mimeType,sizeBytes:bytes.length,sha256:checksum,type:isVideo?"video":"image",livePhotoMotionComponent,status,duplicateOf});
  }
  const manifest={schemaVersion:1,project:{name:projectName,slug,description:"",status:"Draft",featured:false},source:{archive:basename(archive),sha256:createHash("sha256").update(await readFile(archive)).digest("hex")},summary:{total:items.length,images:items.filter(item=>item.type==="image").length,videos:items.filter(item=>item.type==="video").length,standaloneVideos:items.filter(item=>item.type==="video"&&!item.livePhotoMotionComponent).length,livePhotoMotionComponents:items.filter(item=>item.livePhotoMotionComponent).length,albumVisibleItems:items.filter(item=>!item.livePhotoMotionComponent).length,duplicates:items.filter(item=>item.status==="duplicate").length,ready:items.filter(item=>item.status==="ready-for-admin-upload").length,requiresConversion:items.filter(item=>item.status==="requires-conversion").length,failed:items.filter(item=>["unsupported","invalid-container"].includes(item.status)).length},items};
  await mkdir(resolve(output,".."),{recursive:true});await writeFile(output,`${JSON.stringify(manifest,null,2)}\n`);
  console.log(`Prepared ${items.length} files for ${projectName}. Manifest: ${output}`);console.log(JSON.stringify(manifest.summary));
}finally{await rm(work,{recursive:true,force:true})}
