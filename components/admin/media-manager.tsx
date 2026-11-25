"use client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  Crop,
  ImageIcon,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { AdminProject, MediaCrop, MediaItem } from "@/types/admin";
import { ImageCropEditor } from "@/components/admin/image-crop-editor";
import type { ProjectCategory } from "@/types/content";
const field =
  "min-h-11 rounded-md border border-black/10 bg-white px-3 text-sm shadow-sm";
type Local = {
  id: string;
  file: File;
  url: string;
  alt: string;
  caption: string;
  crop?: MediaCrop;
  error?: string;
  progress: number;
  state: "queued" | "uploading" | "failed";
};
export function MediaManager({
  initialItems,
  projects,
  initialProject,
  initialUpload = false,
  storageMode,
}: {
  initialItems: MediaItem[];
  projects: AdminProject[];
  initialProject?: string;
  initialUpload?: boolean;
  storageMode:
    | "emulator"
    | "live-disabled"
    | "approved-staging"
    | "approved-production";
}) {
  const storageEnabled = storageMode !== "live-disabled";
  const mutationRef=useRef(new Set<string>());
  const modeLabel =
    storageMode === "emulator"
      ? "Emulator only"
      : storageMode === "approved-staging"
        ? "Approved staging"
        : storageMode === "approved-production"
          ? "Approved production"
          : "Live uploads blocked";
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<MediaItem | null>(null),
    [editingLocal, setEditingLocal] = useState<Local | null>(null),
    [query, setQuery] = useState(""),
    [project, setProject] = useState(initialProject ?? "all"),
    [category, setCategory] = useState<"all" | ProjectCategory>("all"),
    [mediaType, setMediaType] = useState<"all" | "image" | "video">("all"),
    [usage, setUsage] = useState<"all" | "gallery" | "slideshow" | "unused">("all"),
    [upload, setUpload] = useState(initialUpload),
    [local, setLocal] = useState<Local[]>([]),
    [destination, setDestination] = useState(initialProject ?? ""),
    [busy, setBusy] = useState(false),
    [uploadSummary, setUploadSummary] = useState({completed:0,total:0}),
    [pendingRemoval, setPendingRemoval] = useState<MediaItem | null>(null),
    [message, setMessage] = useState("");
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) &&
          (project === "all" ||
            item.projectId === project ||
            (project === "unassigned" && !item.projectId)) &&
          (category === "all" || item.category === category) &&
          (mediaType === "all" || item.kind === mediaType) &&
          (usage === "all" ||
            (usage === "gallery" && (item.galleryPublished || item.roles?.includes("project-gallery"))) ||
            (usage === "slideshow" && Boolean(item.slideshow)) ||
            (usage === "unused" && !item.galleryPublished && !item.slideshow && !(item.roles??[]).some(role=>role!=="general"))),
      ),
    [items, query, project, category, mediaType, usage],
  );
  const refresh = async () => {
    const response = await fetch("/api/admin/media", { cache: "no-store" }),
      result = await response.json();
    if (response.ok) setItems(result.items);
  };
  const receive = (files: FileList) => {
    const additions = Array.from(files).map((file) => {
      const video = ["video/mp4", "video/quicktime"].includes(file.type),
        lowerName = file.name.toLowerCase(),
        heic =
          ["image/heic", "image/heif"].includes(file.type) ||
          lowerName.endsWith(".heic") ||
          lowerName.endsWith(".heif"),
        allowed =
          video ||
          heic ||
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        limit = video ? 150 * 1024 * 1024 : 10 * 1024 * 1024;
      return {
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        alt: "",
        caption: "",
        progress: 0,
        state: "queued" as const,
        error: !allowed
          ? "Use JPG, PNG, WebP, HEIC, HEIF, MP4 or MOV."
          : file.size > limit
            ? `File must be ${video ? 150 : 10} MB or smaller.`
            : undefined,
      };
    });
    setLocal((current) => [...current, ...additions]);
  };
  const discard = (id: string) =>
    setLocal((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return current.filter((entry) => entry.id !== id);
    });
  const uploadOne = (item: Local) =>
    new Promise<void>((resolve) => {
      const body = new FormData();
      body.set("file", item.file);
      body.set("alt", item.alt);
      body.set("caption", item.caption);
      if (item.crop) body.set("crop", JSON.stringify(item.crop));
      body.set(
        "category",
        projects.find((value) => value.id === destination)?.category ??
          "Combined",
      );
      body.set("projectId", destination);
      const request = new XMLHttpRequest();
      request.open("POST", "/api/admin/media");
      request.upload.onprogress = (event) => {
        if (event.lengthComputable)
          setLocal((current) =>
            current.map((value) =>
              value.id === item.id
                ? {
                    ...value,
                    progress: Math.round((event.loaded / event.total) * 100),
                    state: "uploading",
                  }
                : value,
            ),
          );
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          setUploadSummary((current)=>({...current,completed:current.completed+1}));
          discard(item.id);
          resolve();
          return;
        }
        let error = "Upload failed.";
        try {
          error = JSON.parse(request.responseText).error ?? error;
        } catch {}
        setLocal((current) =>
          current.map((value) =>
            value.id === item.id ? { ...value, state: "failed", error } : value,
          ),
        );
        resolve();
      };
      request.onerror = () => {
        setLocal((current) =>
          current.map((value) =>
            value.id === item.id
              ? {
                  ...value,
                  state: "failed",
                  error: "The upload was interrupted.",
                }
              : value,
          ),
        );
        resolve();
      };
      request.send(body);
    });
  const uploadAll = async () => {
    if(mutationRef.current.has("upload"))return;
    const valid = local.filter((item) => !item.error && item.alt.trim());
    if (!valid.length) {
      setMessage("Add alternative text for every valid image.");
      return;
    }
    mutationRef.current.add("upload");setBusy(true);
    setUploadSummary({completed:0,total:valid.length});
    setMessage("");
    try{await Promise.all(valid.map(uploadOne));
    await refresh();
    setMessage(
      storageMode === "approved-staging"
        ? "Valid images were saved to the approved staging Firebase Storage bucket."
        : storageMode === "approved-production"
          ? "Valid images were saved to the approved production Firebase Storage bucket."
          : "Valid images were saved to the local Firebase emulators.",
    );}catch{setMessage("The upload could not be completed. Check your connection and retry failed files.")}finally{setBusy(false);mutationRef.current.delete("upload")}
  };
  const patch = async (id: string, value: object) => {
    if(mutationRef.current.has(id))return;
    mutationRef.current.add(id);
    setBusy(true);
    try{const response = await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(value),
    });
    if (response.ok) {
      await refresh();
      setMessage("Media details saved.");
    } else setMessage("Unable to save media details.");}catch{setMessage("Unable to save media details. Check your connection and try again.")}finally{mutationRef.current.delete(id);setBusy(false)}
  };
  const remove = async (item: MediaItem) => {
    if(mutationRef.current.has(item.id))return;
    mutationRef.current.add(item.id);setBusy(true);
    try{const response = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      }),
      result = await response.json().catch(() => ({}));
    setMessage(
      response.ok
        ? "Image removed."
        : (result.error ?? "Unable to remove image."),
    );
    setPendingRemoval(null);
    if (response.ok) await refresh();}catch{setMessage("Unable to remove image. Check your connection and try again.")}finally{mutationRef.current.delete(item.id);setBusy(false)}
  };
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-black/[.07] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
              Media Library
            </h1>
            <span
              className={`rounded-full px-2 py-1 text-[.6rem] font-black uppercase tracking-wider ${storageEnabled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
            >
              {modeLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/50">
            Manage approved editorial images and project media used across the website.
          </p>
        </div>
        <button
          disabled={!storageEnabled || busy}
          onClick={() => setUpload((value) => !value)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-wine px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Upload size={17} />
          {upload ? "Close upload" : "Upload images"}
        </button>
      </header>
      {!storageEnabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="flex items-center gap-2 font-bold">
            <CircleAlert size={17} />
            Live editorial uploads are disabled
          </p>
          <p>
            The configured Storage bucket is not used until the server-only
            staging feature gate and owner approvals are enabled. Emulator tests
            cover the upload workflow.
          </p>
        </div>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg border border-black/10 bg-white p-3 text-sm font-semibold"
        >
          {message}
        </p>
      )}
      {upload && storageEnabled && (
        <section className="rounded-lg border border-wine/15 bg-white p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">Add project media</h2>
              <p className="mt-1 text-xs text-ink/45">
                Validated server-side and stored in the currently reported
                storage mode.
              </p>
            </div>
            <button disabled={busy} onClick={() => setUpload(false)} aria-label="Close upload" className="disabled:opacity-35">
              <X size={18} />
            </button>
          </div>
          <label className="mt-4 grid min-h-32 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-black/15 bg-[#faf9f7] p-5 text-center">
            <span>
              <Upload className="mx-auto text-wine" />
              <b className="mt-2 block text-sm">Choose images or videos</b>
              <small className="text-ink/45">
                JPG, PNG, WebP, HEIC or HEIF up to 10 MB; MP4 or MOV up to
                150 MB. HEIC photos are converted automatically.
              </small>
            </span>
            <input
              className="sr-only"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,video/mp4,video/quicktime,.mov"
              onChange={(event) => {
                if (event.target.files) receive(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <label className="mt-4 grid gap-2 text-xs font-bold">
            Optional project assignment
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className={field}
            >
              <option value="">Unassigned</option>
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {local.length > 0 && (
            <div className="mt-4 grid gap-3">
              {local.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded border border-black/10 p-3 sm:grid-cols-[4rem_1fr_auto]"
                >
                  <div className="relative size-16 overflow-hidden rounded bg-paper">
                    {item.file.type.startsWith("video/") ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : ["image/heic", "image/heif"].includes(
                        item.file.type,
                      ) || /\.hei[cf]$/i.test(item.file.name) ? (
                      <div className="grid h-full place-items-center p-1 text-center text-[.6rem] font-bold text-ink/50">
                        HEIC preview after upload
                      </div>
                    ) : (
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <p className="truncate text-xs font-bold">
                      {item.file.name}
                    </p>
                    <input
                      aria-label={`Alternative text for ${item.file.name}`}
                      placeholder="Alternative text (required)"
                      value={item.alt}
                      onChange={(event) =>
                        setLocal((current) =>
                          current.map((value) =>
                            value.id === item.id
                              ? { ...value, alt: event.target.value }
                              : value,
                          ),
                        )
                      }
                      className={field}
                    />
                    <input
                      aria-label={`Caption for ${item.file.name}`}
                      placeholder="Caption (optional)"
                      value={item.caption}
                      onChange={(event) =>
                        setLocal((current) =>
                          current.map((value) =>
                            value.id === item.id
                              ? { ...value, caption: event.target.value }
                              : value,
                          ),
                        )
                      }
                      className={field}
                    />
                    {item.state === "uploading" && (
                      <progress
                        className="w-full"
                        max={100}
                        value={item.progress}
                      >
                        {item.progress}%
                      </progress>
                    )}
                    {item.error && <div><p className="text-xs font-bold text-red-700">{item.error}</p>{item.state==="failed"&&<button type="button" disabled={busy} onClick={()=>setLocal(current=>current.map(value=>value.id===item.id?{...value,state:"queued",error:undefined,progress:0}:value))} className="mt-2 text-xs font-bold text-wine">Retry this file</button>}</div>}
                  </div>
                  <div className="grid gap-2">
                    {!item.file.type.startsWith("video/") &&
                      !["image/heic", "image/heif"].includes(item.file.type) &&
                      !/\.hei[cf]$/i.test(item.file.name) && (
                      <button
                        type="button"
                        onClick={() => setEditingLocal(item)}
                        className="grid size-9 place-items-center rounded border border-wine/20 text-wine"
                        aria-label={`Crop ${item.file.name}`}
                      >
                        <Crop size={16} />
                      </button>
                    )}
                    <button
                      disabled={busy}
                      onClick={() => discard(item.id)}
                      className="grid size-9 place-items-center rounded border border-black/10"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {busy&&uploadSummary.total>0&&<div role="status" aria-live="polite" className="rounded-md bg-wine/[.06] p-3 text-sm font-bold text-wine">Uploading media — {uploadSummary.completed} of {uploadSummary.total} files completed. Files still shown as uploading may be processing on the server.</div>}
              <button
                disabled={busy || !local.some((item) => !item.error)}
                onClick={uploadAll}
                className="min-h-11 rounded bg-wine px-4 text-sm font-bold text-white disabled:opacity-40"
              >
                {busy ? `Uploading — ${uploadSummary.completed} of ${uploadSummary.total}` : "Upload valid media"}
              </button>
            </div>
          )}
        </section>
      )}
      <section className="grid gap-3 rounded-lg border border-black/[.075] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative">
          <span className="sr-only">Search filenames</span>
          <Search size={17} className="absolute left-3 top-3.5 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filenames…"
            className={`${field} w-full pl-9`}
          />
        </label>
        <select
          aria-label="Project filter"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          className={field}
        >
          <option value="all">All projects</option>
          <option value="unassigned">Unassigned</option>
          {projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Category filter"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as typeof category)
          }
          className={field}
        >
          <option value="all">All categories</option>
          <option>Electrical</option>
          <option value="Fiber">Fibre Optic</option>
          <option>Combined</option>
        </select>
        <select aria-label="Media type filter" value={mediaType} onChange={(event)=>setMediaType(event.target.value as typeof mediaType)} className={field}>
          <option value="all">Photos &amp; videos</option><option value="image">Photos only</option><option value="video">Videos only</option>
        </select>
        <select aria-label="Usage filter" value={usage} onChange={(event)=>setUsage(event.target.value as typeof usage)} className={field}>
           <option value="all">All usage</option><option value="gallery">Project gallery</option><option value="unused">Unassigned</option>
        </select>
      </section>
      {visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-charcoal">
                {item.kind === "video" ? (
                  <video
                    src={item.src}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
              <div className="grid gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="mt-1 text-xs text-ink/45">
                      {item.type} · {item.size}
                      {item.width > 0 ? ` · ${item.width}×${item.height}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[.6rem] font-black uppercase ${item.status === "Ready" ? "bg-emerald-50 text-emerald-700" : item.status === "Failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <label className="grid gap-1 text-xs font-bold">
                  Alternative text
                  <input
                    defaultValue={item.alt}
                    onBlur={(event) =>
                      event.target.value !== item.alt &&
                      patch(item.id, { alt: event.target.value })
                    }
                    className={field}
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold">
                  Caption
                  <input
                    defaultValue={item.caption}
                    onBlur={(event) =>
                      event.target.value !== item.caption &&
                      patch(item.id, { caption: event.target.value })
                    }
                    className={field}
                  />
                </label>
                <details className="rounded-md border border-black/10 bg-paper/50 p-3">
                  <summary className="cursor-pointer text-xs font-bold text-ink/55">Legacy project assignment</summary>
                  <p className="mt-2 text-xs leading-5 text-amber-800">For preserved legacy records only. This does not publish the photograph to the public Projects gallery; use Admin → Projects for gallery publication.</p>
                  <label className="mt-3 grid gap-1 text-xs font-bold">
                  Legacy record
                  <select
                    value={item.projectId ?? ""}
                    disabled={busy}
                    onChange={(event) =>
                      patch(item.id, {
                        projectId: event.target.value || null,
                        category:
                          projects.find(
                            (value) => value.id === event.target.value,
                          )?.category ?? item.category,
                      })
                    }
                    className={field}
                  >
                    <option value="">Unassigned</option>
                    {projects.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                  </label>
                </details>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={
                      busy || item.status !== "Ready" || item.kind === "video"
                    }
                    onClick={() => setEditing(item)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-wine/20 text-xs font-bold text-wine"
                  >
                    <Crop size={15} />
                    Edit crop
                  </button>
                  <button
                    aria-label={`Remove ${item.name}`}
                    disabled={busy}
                    onClick={() => setPendingRemoval(item)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-red-200 text-xs font-bold text-red-700"
                  >
                    <Trash2 size={15} />
                    Remove media
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-black/15 bg-white text-center">
          <div>
            <ImageIcon className="mx-auto text-ink/20" />
            <p className="mt-3 font-bold">No editorial media found</p>
            <p className="mt-1 text-sm text-ink/45">
              Upload approved project media when storage access is enabled.
            </p>
          </div>
        </div>
      )}
      {editing && (
        <ImageCropEditor
          src={editing.src}
          name={editing.name}
          initialCrop={editing.crop ?? undefined}
          onCancel={() => setEditing(null)}
          onApply={async (crop: MediaCrop) => {
            await patch(editing.id, { crop });
            setEditing(null);
          }}
        />
      )}
      {editingLocal && (
        <ImageCropEditor
          src={editingLocal.url}
          name={editingLocal.file.name}
          initialCrop={editingLocal.crop}
          onCancel={() => setEditingLocal(null)}
          onApply={(crop: MediaCrop) => {
            setLocal((current) =>
              current.map((value) =>
                value.id === editingLocal.id ? { ...value, crop } : value,
              ),
            );
            setEditingLocal(null);
          }}
        />
      )}
      {pendingRemoval && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-charcoal/55 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => !busy && setPendingRemoval(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-media-title"
            aria-describedby="remove-media-description"
            className="w-full max-w-md overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3 p-5 sm:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
                <Trash2 size={19} />
              </span>
              <div className="min-w-0">
                <h2 id="remove-media-title" className="text-lg font-bold">
                  Remove media?
                </h2>
                <p
                  id="remove-media-description"
                  className="mt-2 text-sm leading-6 text-ink/60"
                >
                  <span className="font-semibold text-ink">
                    {pendingRemoval.name}
                  </span>{" "}
                  will be permanently removed. Media currently used elsewhere
                  on the website cannot be deleted.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-black/[.07] bg-paper/60 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPendingRemoval(null)}
                className="min-h-11 rounded-md border border-black/10 bg-white px-4 text-sm font-bold text-ink disabled:opacity-50"
                autoFocus
              >
                Keep media
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(pendingRemoval)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <Trash2 size={16} />
                {busy ? "Removing…" : "Remove permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
