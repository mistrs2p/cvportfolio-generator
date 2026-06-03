"use client";

import { useState, useRef } from "react";
import { Upload, Link, Loader2 } from "lucide-react";

interface ImageSourceInputProps {
  value: string;
  onChange: (url: string) => void;
  projectId: string;
}

export function ImageSourceInput({
  value,
  onChange,
  projectId,
}: ImageSourceInputProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${projectId}/assets`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }

      onChange(json.data.url);
    } catch {
      setError("Network error, please try again");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-slate-700">
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition ${
            tab === "url"
              ? "bg-indigo-600 text-white"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Link className="w-3 h-3" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition ${
            tab === "upload"
              ? "bg-indigo-600 text-white"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
      </div>

      {/* URL Input */}
      {tab === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      )}

      {/* File Upload */}
      {tab === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="image-upload-input"
          />
          <label
            htmlFor="image-upload-input"
            className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-600 rounded-lg py-4 text-sm cursor-pointer transition hover:border-indigo-500 hover:text-indigo-400 ${
              isUploading ? "opacity-50 cursor-not-allowed" : "text-slate-400"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Click to upload (max 5MB)
              </>
            )}
          </label>

          {/* Preview */}
          {value && (
            <img
              src={value}
              alt="Preview"
              className="mt-2 w-full rounded-lg object-cover max-h-24"
            />
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
