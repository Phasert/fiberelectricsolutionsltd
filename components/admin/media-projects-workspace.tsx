"use client";

import { Library } from "lucide-react";
import { MediaManager } from "@/components/admin/media-manager";
import type { AdminProject, MediaItem } from "@/types/admin";

type StorageMode = "emulator"|"live-disabled"|"approved-staging"|"approved-production";

export function MediaProjectsWorkspace({initialItems,projects,storageMode,initialUpload=false,initialProject}:{initialItems:MediaItem[];projects:AdminProject[];storageMode:StorageMode;initialUpload?:boolean;initialProject?:string}){
 return <div className="space-y-5"><header className="flex items-center gap-3 border-b border-black/[.07] pb-5"><span className="grid size-10 place-items-center rounded-lg bg-wine/10 text-wine"><Library size={19}/></span><div><h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Media Library</h1><p className="mt-1 text-sm text-ink/50">Upload shared media and assign photographs to an existing project collection.</p></div></header><MediaManager initialItems={initialItems} projects={projects} storageMode={storageMode} initialUpload={initialUpload} initialProject={initialProject}/></div>
}
