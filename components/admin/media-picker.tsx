"use client";

import { VisualMediaPicker } from "@/components/admin/visual-media-picker";
import type { MediaItem } from "@/types/admin";

type SharedProps={items:MediaItem[];title:string;role:string;kind?:"all"|"image";max?:number};
export function MediaPicker(props:SharedProps&{value:string;onChange:(value:string)=>void}):React.ReactNode;
export function MediaPicker(props:SharedProps&{value:string[];onChange:(value:string[])=>void}):React.ReactNode;
export function MediaPicker({items,value,onChange,title,role,kind="image",max=50}:SharedProps&({value:string;onChange:(value:string)=>void}|{value:string[];onChange:(value:string[])=>void})){
 const multiple=Array.isArray(value);
 return <VisualMediaPicker items={items} value={multiple?value:value?[value]:[]} onConfirm={(ids)=>multiple?(onChange as (value:string[])=>void)(ids):(onChange as (value:string)=>void)(ids[0]??"")} title={title} description={`Choose or upload files for ${role}.`} kind={kind} multiple={multiple} max={multiple?max:1} />;
}
