'use client';

import { useEffect, useState, useCallback } from 'react';

interface ErowallRandomImageProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function ErowallRandomImage({
  width = 800,
  height = 600,
  className = ''
}: ErowallRandomImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchRandomImage = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/erowall');
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const data = await response.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch image:', err);
      throw err;
    }
  }, []);

  const loadImage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const url = await fetchRandomImage();
      if (url) {
        const img = new Image();
        img.onload = () => {
          setImageUrl(url);
          setIsLoading(false);
        };
        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };
        img.src = url;
      }
    } catch (err) {
      setError('Failed to fetch image');
      setIsLoading(false);
    }
  }, [fetchRandomImage]);

  const rotateImage = useCallback(async () => {
    if (isLoading) return;
    await loadImage();
  }, [isLoading, loadImage]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-red-500 ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 animate-pulse z-10" />
      )}

      {/* Main Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Random Erowall Wallpaper"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
        />
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Text Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-xl font-sans tracking-wide text-left leading-tight max-w-xs">
          Random Image
        </p>
      </div>

      {/* Rotate Button */}
      <button
        onClick={rotateImage}
        disabled={isLoading}
        className="absolute top-2 right-2 p-2 bg-black/60 text-yellow-400 rounded-full hover:bg-black/80 transition-all z-20 disabled:opacity-50"
        aria-label="Rotate image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isLoading ? 'animate-spin' : ''}`}
        >
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
      </button>
    </div>
  );
}
