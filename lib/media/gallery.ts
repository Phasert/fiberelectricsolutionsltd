import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { urlFromData } from "@/lib/media/public-repository";
import type { ProjectImage, PublicProject } from "@/types/content";

export async function isPublishedGalleryMedia(mediaId:string){const document=await getAdminFirestore().collection("media").doc(mediaId).get();return document.exists&&document.data()?.status==="Ready"&&document.data()?.galleryPublished===true}

export async function listPublishedMediaGalleries():Promise<PublicProject[]> {
 const snapshot=await getAdminFirestore().collection("media").where("galleryPublished","==",true).get(),groups:{Electrical:ProjectImage[];Fiber:ProjectImage[]}={Electrical:[],Fiber:[]};
 snapshot.docs.filter(document=>document.data().status==="Ready"&&document.data().kind==="editorial-image").sort((a,b)=>Number(a.data().galleryOrder??0)-Number(b.data().galleryOrder??0)).forEach(document=>{const data=document.data(),category=data.category==="Fiber"?"Fiber":data.category==="Electrical"?"Electrical":null,src=urlFromData(document.id,data,"lg");if(category&&src)groups[category].push({src,alt:String(data.alt??`${category} project photo`)})});
 return (Object.keys(groups) as Array<keyof typeof groups>).flatMap(category=>{const gallery=groups[category];if(!gallery.length)return[];const title=category==="Fiber"?"Fiber Optic Gallery":"Electrical Gallery";return[{id:`media-gallery-${category.toLowerCase()}`,slug:`gallery-${category.toLowerCase()}`,title,category,summary:"",featuredImage:gallery[0].src,featuredImageAlt:gallery[0].alt??`${title} photo`,gallery,featured:false}]});
}
