"use client";
import { useState } from "react";

export default function UploadForm() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const fileInput = e.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);
    setUrl(data.url);
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col items-center space-y-4 p-6">
      <input type="file" name="file" accept="audio/*" className="text-sm" />
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl">
        {uploading ? "Uploading..." : "Upload Mix"}
      </button>
      {url && <p className="text-green-400">Uploaded: {url}</p>}
    </form>
  );
}
