// app/components/common/SafeImage.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallbackClassName?: string;
}

// Default placeholder SVG as data URL
const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f3f4f6"/>
  <path d="M70 90 L100 70 L130 90 L130 130 L70 130 Z" fill="#d1d5db"/>
  <circle cx="85" cy="80" r="8" fill="#d1d5db"/>
  <path d="M70 115 L90 100 L110 115 L130 95" stroke="#9ca3af" fill="none" stroke-width="3"/>
</svg>
`)}`;

export default function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  fallbackClassName = '',
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no src or already has error, show placeholder
  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className}`}>
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Build the proper image URL
  const getImageUrl = (imageSrc: string): string => {
    // If it's already a full URL, return as is
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('data:')) {
      return imageSrc;
    }
    // If it's a relative path, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jshope-backend-phs3.vercel.app/jshope';
    // Remove /api/jshope from base URL to get the server root
    const serverRoot = baseUrl.replace(/\/api\/jshope\/?$/, '');
    return `${serverRoot}${imageSrc.startsWith('/') ? '' : '/'}${imageSrc}`;
  };

  const imageUrl = getImageUrl(src);

  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
          unoptimized
        />
      </>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className="bg-gray-100 animate-pulse" 
          style={{ width: width || 100, height: height || 100 }}
        />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={width || 100}
        height={height || 100}
        className={`${className} ${isLoading ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        unoptimized
      />
    </>
  );
}
