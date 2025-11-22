'use client';

import { useState } from 'react';
import { Download, Loader2, ExternalLink } from 'lucide-react';

interface VideoInfo {
  downloadUrl: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  filesize?: number;
  format?: string;
}

export default function DownloadPage() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('720');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality }),
      });

      const data = await response.json();

      if (response.ok) {
        setVideoInfo(data);
      } else {
        setError(data.error || 'Failed to extract video URL');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (videoInfo?.downloadUrl) {
      window.open(videoInfo.downloadUrl, '_blank');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Video Downloader
        </h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Video URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="360">360p</option>
                <option value="480">480p</option>
                <option value="720">720p (Recommended)</option>
                <option value="1080">1080p</option>
                <option value="2160">4K</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Extracting...
                </>
              ) : (
                <>
                  <ExternalLink size={20} />
                  Get Download Link
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {videoInfo && (
          <div className="mt-6 bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div className="flex items-start gap-4">
              {videoInfo.thumbnail && (
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{videoInfo.title}</h3>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>Duration: {formatDuration(videoInfo.duration)}</p>
                  <p>Size: {formatFileSize(videoInfo.filesize)}</p>
                  <p>Format: {videoInfo.format}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download Video
            </button>

            <p className="text-gray-500 text-xs text-center mt-2">
              Note: Download link may expire after a few hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
