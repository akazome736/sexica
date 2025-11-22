'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Play, AlertCircle, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-2xl mx-auto space-y-16">

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-benne font-bold text-white leading-tight">
            Paste your URL<br />
            <span className="text-yellow-400">then download</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            Extract and download videos from any platform instantly
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-8">

          {/* URL Input */}
          <div className="space-y-3">
            <label className="text-white/80 text-sm font-medium uppercase tracking-wider">
              Video URL
            </label>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="bg-transparent border-0 border-b-2 border-white/30 text-white placeholder:text-white/40 text-lg md:text-xl h-14 px-0 focus:border-yellow-400 focus:ring-0 transition-colors"
                required
              />

              {/* Quality Selection - Hidden initially, show after URL */}
              {url && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-white/80 text-sm font-medium uppercase tracking-wider">
                    Quality
                  </label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="bg-transparent border-0 border-b-2 border-white/30 text-white h-12 px-0 focus:border-yellow-400 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                      <SelectGroup>
                        <SelectLabel className="text-white/70 text-xs font-medium">Standard Quality</SelectLabel>
                        <SelectItem value="360" className="text-white hover:bg-white/10 focus:bg-white/10">
                          360p - Fast Download
                        </SelectItem>
                        <SelectItem value="480" className="text-white hover:bg-white/10 focus:bg-white/10">
                          480p - Standard Quality
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-white/70 text-xs font-medium">HD Quality</SelectLabel>
                        <SelectItem value="720" className="text-white hover:bg-white/10 focus:bg-white/10">
                          720p - HD Quality (Recommended)
                        </SelectItem>
                        <SelectItem value="1080" className="text-white hover:bg-white/10 focus:bg-white/10">
                          1080p - Full HD
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-white/70 text-xs font-medium">Ultra HD</SelectLabel>
                        <SelectItem value="2160" className="text-white hover:bg-white/10 focus:bg-white/10">
                          2160p - 4K Ultra HD
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg md:text-xl h-16 rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Fetching Video...
                    </>
                  ) : (
                    <>
                      <Play className="mr-3 h-6 w-6" />
                      Get Video
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Video Preview - Show after successful fetch */}
          {videoInfo && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-4">
                <div className="w-full max-w-md mx-auto aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/10">
                  {videoInfo.thumbnail ? (
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-lg line-clamp-2">
                    {videoInfo.title}
                  </h3>
                  <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <span>{formatDuration(videoInfo.duration)}</span>
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(videoInfo.filesize)}</span>
                    <span>•</span>
                    <Badge variant="outline" className="border-white/30 text-white/70">
                      {videoInfo.format || 'MP4'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg md:text-xl h-16 rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Download className="mr-3 h-6 w-6" />
                Download Video
              </Button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert className="bg-red-900/20 border-red-700/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm md:text-base">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-16 border-t border-white/10">
          <p className="text-white/40 text-sm">
            Supported: YouTube, TikTok, Instagram, Twitter, and 1800+ more sites
          </p>
        </div>
      </div>
    </div>
  );
}
