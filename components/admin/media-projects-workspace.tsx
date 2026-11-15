"use client";

import { Images, Library, MonitorPlay } from "lucide-react";
import { useState } from "react";
import { GalleryOrganizer } from "@/components/admin/gallery-organizer";
import { MediaManager } from "@/components/admin/media-manager";
import { SlideshowManager } from "@/components/admin/slideshow-manager";
import type { AdminProject, MediaItem } from "@/types/admin";

type Tab = "gallery" | "slideshows" | "library";
type StorageMode = "emulator"|"live-disabled"|"approved-staging"|"approved-production";
const tabs=[{id:"gallery" as const,label:"Gallery",icon:Images,description:"Public Projects media"},{id:"slideshows" as const,label:"Slideshows",icon:MonitorPlay,description:"Homepage and services"},{id:"library" as const,label:"Media Library",icon:Library,description:"Every uploaded asset"}];

export function MediaProjectsWorkspace({initialItems,projects,storageMode,initialTab="gallery"}:{initialItems:MediaItem[];projects:AdminProject[];storageMode:StorageMode;initialTab?:Tab}){
 const[tab,setTab]=useState<Tab>(initialTab),[items,setItems]=useState(initialItems);
 const refresh=async()=>{const response=await fetch("/api/admin/media",{cache:"no-store"}),result=await response.json().catch(()=>({}));if(response.ok)setItems(result.items??[])};
 return <div className="space-y-5"><header className="border-b border-black/[.07] pb-5"><h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Media &amp; Projects</h1><p className="mt-1 text-sm text-ink/50">Manage the public project gallery, website slideshows and shared Media Library in one workspace.</p></header><nav className="grid gap-2 rounded-xl border border-black/[.075] bg-white p-2 shadow-sm sm:grid-cols-3" aria-label="Media and Projects workspace">{tabs.map(({id,label,icon:Icon,description})=><button key={id} type="button" onClick={()=>{setTab(id);history.replaceState(null,"",`/admin/media?tab=${id}`)}} aria-current={tab===id?"page":undefined} className={`flex min-h-16 items-center gap-3 rounded-lg px-4 text-left ${tab===id?"bg-wine text-white":"hover:bg-paper"}`}><Icon size={19}/><span><b className="block text-sm">{label}</b><span className={`mt-0.5 block text-[.68rem] ${tab===id?"text-white/65":"text-ink/40"}`}>{description}</span></span></button>)}</nav>{tab==="gallery"&&<GalleryOrganizer initialItems={items} storageMode={storageMode}/>} {tab==="slideshows"&&<SlideshowManager items={items} refresh={refresh}/>} {tab==="library"&&<MediaManager initialItems={items} projects={projects} storageMode={storageMode}/>}</div>
}
