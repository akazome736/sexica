"use client";

import { useState } from "react";

interface VideoInfo {
  downloadUrl: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  filesize?: number;
  format?: string;
}

export default function DownloadPage() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("720");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const qualityOptions = ["360", "480", "720", "1080", "2160"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality }),
      });

      const data = await response.json();

      if (response.ok) {
        setVideoInfo(data);
      } else {
        setError(data.error || "Failed to extract video URL");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (videoInfo?.downloadUrl) {
      window.open(videoInfo.downloadUrl, "_blank");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 lg:px-12 py-10 lg:py-14 relative overflow-hidden text-white font-sans text-[12px] tracking-[0.12em]">
      {/* subtle blurred blobs for depth */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-10 w-72 h-72 bg-pink-500/40 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-10 w-72 h-72 bg-purple-500/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl xl:max-w-7xl space-y-12">
        {/* Top: URL input + FETCH button */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Video URL..."
            className="flex-1 bg-white/5 border border-white/20 rounded-2xl px-5 py-3 outline-none focus:border-pink-400/80 focus:ring-2 focus:ring-pink-400/40 placeholder-white/40 transition-all duration-300 backdrop-blur-md"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="md:w-40 w-full border border-white/40 rounded-2xl py-3 text-center uppercase tracking-[0.18em] disabled:opacity-40 bg-white/5 hover:bg-white/15 transition-colors duration-200"
          >
            {loading ? "FETCHING..." : "FETCH"}
          </button>
        </form>

        {/* Middle row: left preview, right info */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 lg:gap-10">
          {/* Left side: title + large preview rectangle */}
          <div>
            <div className="mb-6 h-5 flex items-center">
              {videoInfo ? (
                <span className="uppercase">
                  {videoInfo.title.length > 60
                    ? videoInfo.title.slice(0, 57) + "..."
                    : videoInfo.title}
                </span>
              ) : (
                <span className="uppercase text-white/40">TITLE TITLE TITLE</span>
              )}
            </div>

            <div className="border border-white/15 bg-white/5 rounded-3xl h-64 md:h-80 xl:h-[420px] flex items-center justify-center overflow-hidden backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
              {videoInfo?.thumbnail ? (
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="uppercase text-white/30 text-[10px]">PREVIEW AREA</span>
              )}
            </div>
          </div>

          {/* Right side: selectable quality/size rows + DOWNLOAD button */}
          <div className="flex flex-col h-full gap-4">
            <div className="border border-white/15 bg-white/5 rounded-3xl flex-1 flex flex-col overflow-hidden backdrop-blur-xl">
              {qualityOptions.map((q, index) => {
                const isSelected = q === quality;
                const isLast = index === qualityOptions.length - 1;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`flex-1 flex items-center justify-between px-5 text-left uppercase text-[10px] transition-colors ${
                      isLast ? "" : "border-b border-white/15"
                    } ${
                      isSelected
                        ? "bg-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                        : "text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span>{q}p</span>
                    <span className="text-white/40">
                      {videoInfo ? formatFileSize(videoInfo.filesize) : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleDownload}
              disabled={!videoInfo}
              className="w-40 self-end border border-white/40 rounded-2xl py-3 text-center uppercase tracking-[0.18em] disabled:opacity-30 bg-white/5 hover:bg-white/15 transition-colors duration-200"
            >
              DOWNLOAD
            </button>
          </div>
        </div>

        {/* Bottom-left error text */}
        {error && (
          <div className="text-red-400 text-[10px] uppercase tracking-[0.2em]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
