'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Play, AlertCircle, ChevronDown } from "lucide-react";
import ErowallRandomImage from "@/components/ErowallRandomImage";

interface VideoInfo {
  title: string;
  thumbnail?: string;
  duration?: number;
  availableQualities?: string[];
  downloadUrl?: string;
  filesize?: number;
  format?: string;
}

export default function DTPage() {
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('720');
  const [isLoading, setIsLoading] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, action: 'metadata' }),
      });

      const data = await response.json();

      if (response.ok) {
        setVideoInfo(data);
        setShowThumbnail(true);
        setShowDescription(false);
        // Set default quality to first available or 720p
        if (data.availableQualities && data.availableQualities.length > 0) {
          const defaultQuality = data.availableQualities.includes('720') ? '720' : data.availableQualities[0];
          setSelectedQuality(defaultQuality);
        }
      } else {
        setError(data.error || "Failed to extract video URL");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality: selectedQuality, action: 'download' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update video info with download details
        setVideoInfo(prev => prev ? { ...prev, ...data } : data);

        // Force download using fetch + blob
        try {
          const downloadResponse = await fetch(data.downloadUrl);
          const blob = await downloadResponse.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${data.title || 'video'}.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL after download starts
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (downloadError) {
          // Fallback to direct link if blob download fails
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = `${data.title || 'video'}.mp4`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setError(data.error || "Failed to download video");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
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
    <div 
      className="min-h-screen bg-black flex flex-col relative overflow-hidden"
      style={videoInfo?.thumbnail ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${videoInfo.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {/* Additional blur overlay for better text readability */}
      {videoInfo?.thumbnail && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      )}
      
      <div className="flex-1 flex flex-col items-center px-4 pt-28 md:pt-40 relative z-10">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-yellow-300 text-5xl md:text-7xl font-benne font-normal mb-12 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            Just Download it.
          </h1>
          
          <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-8">
            <div className="relative flex items-center">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video URL here..."
                className={`h-14 px-6 text-base rounded-full focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 transition-all duration-300 hover:border-yellow-400/60 w-full font-sans font-normal tracking-wide placeholder:font-normal placeholder:tracking-normal ${
                  videoInfo?.thumbnail 
                    ? 'bg-black/60 backdrop-blur-md border-2 border-yellow-400/50 text-white placeholder:text-yellow-400/80 focus-visible:ring-offset-black' 
                    : 'bg-black/30 backdrop-blur-sm border-2 border-yellow-400/40 text-white placeholder:text-yellow-400/70 focus-visible:ring-offset-black'
                }`}
              />
            </div>
          </form>

          {showThumbnail && (
            <div className="mt-12 w-full max-w-2xl">
              {videoInfo ? (
                // Real Video Preview
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <div className="w-full max-w-md mx-auto aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/10 relative">
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

                      {/* Title Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent h-32 flex items-end p-4">
                        <h3 className="text-white font-semibold text-lg line-clamp-2 leading-tight text-left">
                          {videoInfo.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <span>{formatDuration(videoInfo.duration)}</span>
                        </span>
                        {videoInfo.filesize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(videoInfo.filesize)}</span>
                          </>
                        )}
                        {videoInfo.format && !videoInfo.format.toLowerCase().includes('unknown') && !videoInfo.format.includes('hls-') && !/\d+x\d+/.test(videoInfo.format) && !/\d+\s*-\s*\d+x\d+/.test(videoInfo.format) && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="border-white/30 text-white/70">
                              {videoInfo.format}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Placeholder Random Image
                <ErowallRandomImage
                  className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-yellow-400/30 shadow-lg shadow-yellow-500/10"
                />
              )}

              <div className="mt-8 flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-black/30 border-yellow-400/40 text-white hover:bg-black/50 hover:border-yellow-400/60 transition-all duration-300 min-w-[260px] h-14 justify-between px-8 rounded-full"
                    >
                      <span className="font-sans font-medium">
                        Quality: {selectedQuality}p
                      </span>
                      <ChevronDown className="ml-3 h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 border-yellow-400/40 backdrop-blur-xl w-[280px] rounded-xl">
                    {videoInfo?.availableQualities ? (
                      videoInfo.availableQualities.map((quality) => {
                        const qualityLabels: { [key: string]: string } = {
                          '360': '360p - Fast Download',
                          '480': '480p - Standard Quality',
                          '720': '720p - HD Quality',
                          '1080': '1080p - Full HD',
                          '1440': '1440p - 2K',
                          '2160': '2160p - 4K Ultra HD'
                        };

                        return (
                          <DropdownMenuItem
                            key={quality}
                            className="text-white hover:bg-yellow-400/20 focus:bg-yellow-400/20 cursor-pointer font-sans py-4 px-6 rounded-lg first:rounded-t-xl last:rounded-b-xl"
                            onClick={() => setSelectedQuality(quality)}
                          >
                            {qualityLabels[quality] || `${quality}p`}
                          </DropdownMenuItem>
                        );
                      })
                    ) : (
                      // Fallback options if no qualities available
                      <>
                        <DropdownMenuItem
                          className="text-white hover:bg-yellow-400/20 focus:bg-yellow-400/20 cursor-pointer font-sans py-4 px-6 rounded-lg first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => setSelectedQuality('360')}
                        >
                          360p - Fast Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-yellow-400/20 focus:bg-yellow-400/20 cursor-pointer font-sans py-4 px-6 rounded-lg first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => setSelectedQuality('480')}
                        >
                          480p - Standard Quality
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-yellow-400/20 focus:bg-yellow-400/20 cursor-pointer font-sans py-4 px-6 rounded-lg first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => setSelectedQuality('720')}
                        >
                          720p - HD Quality
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-yellow-400/20 focus:bg-yellow-400/20 cursor-pointer font-sans py-4 px-6 rounded-lg first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => setSelectedQuality('1080')}
                        >
                          1080p - Full HD
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-yellow-400/20 focus:bg-yellow-400/20 cursor-pointer font-sans py-4 px-6 rounded-lg first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => setSelectedQuality('2160')}
                        >
                          2160p - 4K Ultra HD
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert className="bg-red-900/20 border-red-700/50 text-red-200 mt-8 max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm md:text-base">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="w-full px-4 pb-6 pt-6 sticky bottom-0 bg-black/95 backdrop-blur-sm border-t border-yellow-400/10">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="w-full">
            <Button
              type={videoInfo ? "button" : "submit"}
              onClick={videoInfo ? handleDownload : undefined}
              disabled={isLoading || !url.trim()}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-semibold text-xl md:text-2xl py-6 md:py-8 px-8 md:px-12 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-400/40 border-2 border-yellow-400/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Fetching...
                </>
              ) : videoInfo ? (
                <>
                  <Download className="mr-3 h-6 w-6" />
                  Download Video
                </>
              ) : (
                <>
                  <Play className="mr-3 h-6 w-6" />
                  Get Video
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
