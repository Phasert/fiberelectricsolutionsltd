"use client";

import { useMemo, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Check, RotateCcw, RotateCw, X } from "lucide-react";
import type { MediaAspectRatio, MediaCrop } from "@/types/admin";

const aspectOptions: Array<{ value: MediaAspectRatio; label: string }> = [
  { value: "original", label: "Original" }, { value: "freeform", label: "Freeform" }, { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" },
];
const fixedRatios: Partial<Record<MediaAspectRatio, number>> = { "1:1": 1, "4:3": 4 / 3, "16:9": 16 / 9, "9:16": 9 / 16 };

export function ImageCropEditor({ src, name, initialCrop, defaultAspectRatio="original", onCancel, onApply }: { src: string; name: string; initialCrop?: MediaCrop; defaultAspectRatio?:MediaAspectRatio; onCancel: () => void; onApply: (crop: MediaCrop) => void | Promise<void> }) {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(initialCrop?.rotation ?? 0);
  const [aspectRatio, setAspectRatio] = useState<MediaAspectRatio>(initialCrop?.aspectRatio ?? defaultAspectRatio);
  const [naturalRatio, setNaturalRatio] = useState(4 / 3);
  const [freeformRatio, setFreeformRatio] = useState(4 / 3);
  const [area, setArea] = useState<Area | null>(initialCrop ? { x: initialCrop.x, y: initialCrop.y, width: initialCrop.width, height: initialCrop.height } : null);
  const [saving, setSaving] = useState(false);
  const aspect = useMemo(() => aspectRatio === "freeform" ? freeformRatio : fixedRatios[aspectRatio] ?? naturalRatio, [aspectRatio, freeformRatio, naturalRatio]);

  const reset = () => { setPosition({ x: 0, y: 0 }); setZoom(1); setRotation(0); setAspectRatio(defaultAspectRatio); setFreeformRatio(4 / 3); setArea(null); };
  const apply = async () => {
    if (!area) return;
    setSaving(true);
    try { await onApply({ x: Math.round(area.x), y: Math.round(area.y), width: Math.round(area.width), height: Math.round(area.height), rotation, aspectRatio }); }
    finally { setSaving(false); }
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="crop-editor-title" className="fixed inset-0 z-[100] flex bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
    <div className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[94vh] sm:max-w-5xl sm:rounded-xl">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-black/10 px-4 py-3 sm:px-5"><div className="min-w-0"><p className="text-[.62rem] font-black uppercase tracking-[.15em] text-wine">Image editor</p><h2 id="crop-editor-title" className="truncate text-lg font-bold">Crop {name}</h2></div><button type="button" onClick={onCancel} className="grid size-10 shrink-0 place-items-center rounded-md hover:bg-black/5" aria-label="Cancel image editing"><X size={20}/></button></header>
      <div className="relative min-h-64 flex-1 bg-[#171517] sm:min-h-[32rem]"><Cropper image={src} crop={position} zoom={zoom} rotation={rotation} aspect={aspect} minZoom={1} maxZoom={4} zoomWithScroll onCropChange={setPosition} onZoomChange={setZoom} onCropComplete={(_, pixels) => setArea(pixels)} onMediaLoaded={({ naturalWidth, naturalHeight }) => setNaturalRatio(naturalWidth / naturalHeight)} initialCroppedAreaPixels={initialCrop ? { x: initialCrop.x, y: initialCrop.y, width: initialCrop.width, height: initialCrop.height } : undefined} showGrid /></div>
      <div className="shrink-0 space-y-4 border-t border-black/10 bg-white p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"><div><span className="text-xs font-bold">Aspect ratio</span><div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Crop aspect ratio">{aspectOptions.map(option => <button key={option.value} type="button" onClick={() => setAspectRatio(option.value)} className={`min-h-10 shrink-0 rounded-md border px-3 text-xs font-bold ${aspectRatio === option.value ? "border-wine bg-wine text-white" : "border-black/12 bg-white text-ink"}`}>{option.label}</button>)}</div></div><div className="flex gap-2"><button type="button" onClick={() => setRotation(value => ((value + 90) % 360) as typeof value)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-black/12 px-3 text-xs font-bold"><RotateCw size={15}/>Rotate 90°</button></div></div>
        <label className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs font-bold"><span>Zoom</span><input type="range" min={1} max={4} step={0.01} value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-wine"/><output>{Math.round(zoom * 100)}%</output></label>
        {aspectRatio === "freeform" && <label className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs font-bold"><span>Crop shape</span><input type="range" min={0.4} max={2.5} step={0.01} value={freeformRatio} onChange={event => setFreeformRatio(Number(event.target.value))} className="w-full accent-wine"/><output>{freeformRatio.toFixed(2)}:1</output></label>}
        <div className="flex flex-col-reverse gap-2 border-t border-black/8 pt-4 sm:flex-row sm:justify-between"><button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-black/12 px-4 text-sm font-bold"><RotateCcw size={16}/>Reset</button><div className="flex gap-2"><button type="button" onClick={onCancel} className="min-h-11 flex-1 rounded-md border border-black/12 px-5 text-sm font-bold sm:flex-none">Cancel</button><button type="button" disabled={!area || saving} onClick={apply} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-wine px-5 text-sm font-bold text-white disabled:opacity-50 sm:flex-none"><Check size={16}/>{saving ? "Applying…" : "Apply crop"}</button></div></div>
      </div>
    </div>
  </div>;
}
