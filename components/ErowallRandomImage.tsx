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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchRandomImage = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/erowall');
      const data = await response.json();
      if (data.imageUrl) {
        return data.imageUrl;
      } else {
        throw new Error('No image URL');
      }
    } catch (err) {
      console.error('Failed to fetch image:', err);
      return '';
    }
  }, []);

  const [transitioning, setTransitioning] = useState<boolean>(false);

  const rotateImage = useCallback(async () => {
    setTransitioning(true);
    const newUrl = await fetchRandomImage();
    if (newUrl) {
      // Preload the image
      const img = new Image();
      img.onload = () => {
        setImageUrl(newUrl);
        setTransitioning(false);
      };
      img.src = newUrl;
    } else {
      setTransitioning(false);
    }
  }, [fetchRandomImage]);

  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadInitial = async () => {
      const url = await fetchRandomImage();
      if (url) {
        // Preload the image
        const img = new Image();
        img.onload = () => {
          setImageUrl(url);
          setImageLoaded(true);
          setLoading(false);
        };
        img.src = url;
      } else {
        setError('Failed to load image');
        setLoading(false);
      }
    };
    loadInitial();
  }, [fetchRandomImage]);

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
      <img
        src={imageUrl}
        alt="Random Erowall Wallpaper"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 blur-sm ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
      />
      <button
        onClick={rotateImage}
        className="absolute top-2 right-2 px-3 py-1 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors z-10"
      >
        🔄
      </button>
    </div>
  );
}
