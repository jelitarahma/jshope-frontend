'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PromoBannerProps {
  imageUrl: string;
  alt?: string;
  link?: string;
}

export default function PromoBanner({ 
  imageUrl, 
  alt = "Promotional Banner",
  link = "/products"
}: PromoBannerProps) {
  const BannerContent = (
    <div className="relative w-full h-[200px] md:h-[300px] lg:h-[350px] rounded-2xl overflow-hidden group">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="100vw"
        unoptimized
        priority
      />
      {/* Subtle gradient overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        {BannerContent}
      </Link>
    );
  }

  return BannerContent;
}
