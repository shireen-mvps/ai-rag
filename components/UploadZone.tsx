"use client";

import { useRef, useState, useCallback } from "react";
import type { DocMeta } from "@/types";

const UPLOAD_STEPS = ["extracting", "chunking", "indexing", "done"] as const;
type UploadStepKey = (typeof UPLOAD_STEPS)[number];

const STEP_LABELS: Record<UploadStepKey, string> = {
  extracting: "Extracting",
  chunking:   "Chunking",
  indexing:   "Indexing",
  done:       "Ready",
};

export default function UploadZone({
  onUpload,
  uploading,
  uploadStep,
  doc,
}: {
  onUpload: (file: File) => void;
  uploading: boolean;
  uploadStep: string | null;
  doc: DocMeta | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === "application/pdf") onUpload(file);
    },
    [onUpload]
  );

  const activeStep = uploading
    ? (UPLOAD_STEPS.find((s) => uploadStep?.toLowerCase().includes(s)) ?? "extracting")
    : null;

  const activeIndex = activeStep ? UPLOAD_STEPS.indexOf(activeStep) : -1;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
        dragging
          ? "border-k-accent/60 bg-k-accent/[0.07] shadow-[0_0_20px_rgba(232,160,32,0.12)]"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
      } ${uploading ? "pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }}
      />

      {uploading ? (
        /* ── Uploading state ── */
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-k-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-k-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>

          <p className="text-sm font-medium text-k-accent">{uploadStep ?? "Processing PDF..."}</p>

          {/* Segmented progress bar */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex gap-1">
              {(["extracting", "chunking", "indexing"] as UploadStepKey[]).map((s, i) => {
                const sIdx = UPLOAD_STEPS.indexOf(s);
                const isDone = activeIndex > sIdx;
                const isCurrent = activeStep === s;
                return (
                  <div key={s} className="flex-1 flex flex-col gap-1.5">
                    <div className={`h-1 rounded-full transition-all duration-500 ${
                      isDone
                        ? "bg-k-accent"
                        : isCurrent
                        ? "bg-k-accent/50 animate-pulse"
                        : "bg-white/[0.08]"
                    }`} />
                  </div>
                );
              })}
            </div>
            <div className="flex">
              {(["extracting", "chunking", "indexing"] as UploadStepKey[]).map((s) => {
                const sIdx = UPLOAD_STEPS.indexOf(s);
                const isDone = activeIndex > sIdx;
                const isCurrent = activeStep === s;
                return (
                  <div key={s} className="flex-1 text-center">
                    <span className={`text-xs transition-colors ${
                      isCurrent ? "text-k-accent font-semibold" : isDone ? "text-k-accent/60" : "text-k-text/40"
                    }`}>
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      ) : doc ? (
        /* ── Doc loaded state ── */
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-xl bg-k-accent/10 flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-k-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-k-text truncate max-w-[200px]">{doc.filename}</p>
          <p className="text-sm text-k-text/70">{doc.pages} pages · {doc.chunks} chunks indexed</p>
          <p className="text-sm text-k-text/50 mt-0.5">Drop or click to replace</p>
        </div>

      ) : (
        /* ── Empty state ── */
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-1 transition-transform group-hover:scale-105">
            <svg className="w-5 h-5 text-k-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-k-text/75">
            Drop your PDF here or{" "}
            <span className="text-k-accent underline underline-offset-2">browse</span>
          </p>
          <p className="text-sm text-k-text/60">PDF only · Max 10MB</p>
        </div>
      )}
    </div>
  );
}
