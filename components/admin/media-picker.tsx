"use client";

import { VisualMediaPicker } from "@/components/admin/visual-media-picker";
import type { MediaItem } from "@/types/admin";

export function MediaPicker({items,value,onChange,title,role}:{items:MediaItem[];value:string;onChange:(value:string)=>void;title:string;role:string}){
 return <VisualMediaPicker items={items} value={value?[value]:[]} onConfirm={(ids)=>onChange(ids[0]??"")} title={title} description={`Choose Ready editorial media suitable for ${role}.`} />;
}
