"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, Play, FileVideo, Clock, HardDrive } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 lg:px-12 py-10 lg:py-14 relative overflow-hidden">
      {/* subtle blurred blobs for depth */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-10 w-72 h-72 bg-pink-500/40 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-10 w-72 h-72 bg-purple-500/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl xl:max-w-7xl space-y-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-2">
            Sexica - Download
          </h1>
          <p className="text-white/70 text-lg">
            Extract and download videos from any platform
          </p>
        </div>

        {/* URL Input and Fetch Button */}
        <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Play className="h-5 w-5" />
              Video URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter Video URL..."
                className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="md:w-40 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Fetch"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quality Selection */}
        <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileVideo className="h-5 w-5" />
              Quality Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="bg-white/10 border-white/30 text-white">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="360">360p - Fast Download</SelectItem>
                <SelectItem value="480">480p - Standard Quality</SelectItem>
                <SelectItem value="720">720p - HD Quality (Recommended)</SelectItem>
                <SelectItem value="1080">1080p - Full HD</SelectItem>
                <SelectItem value="2160">4K - Ultra HD</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Middle row: left preview, right info */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 lg:gap-10">
          {/* Left side: title + large preview */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">
                {videoInfo ? (
                  videoInfo.title.length > 60
                    ? videoInfo.title.slice(0, 57) + "..."
                    : videoInfo.title
                ) : (
                  "Video Title"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80 xl:h-[420px] bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                {videoInfo?.thumbnail ? (
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white/50 text-center">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p>Preview Area</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right side: video info + download button */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Video Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {videoInfo ? formatDuration(videoInfo.duration) : "--:--"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <HardDrive className="h-4 w-4" />
                  <span>Size: {videoInfo ? formatFileSize(videoInfo.filesize) : "Unknown"}</span>
                </div>
                <div className="text-white/80">
                  Format: {videoInfo?.format || "N/A"}
                </div>
                <div className="text-white/80">
                  Quality: {quality}p
                </div>
              </div>

              <Button
                onClick={handleDownload}
                disabled={!videoInfo}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Video
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-700 text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="text-center text-white/50 text-sm">
          <p>Supported: YouTube, TikTok, Instagram, Twitter, and 1800+ more sites</p>
        </div>
      </div>
    </div>
  );
}
