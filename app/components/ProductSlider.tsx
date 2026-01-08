'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, productService } from '@/lib/services/productService';

interface ProductSliderProps {
  products: Product[];
  isLoading?: boolean;
}

function ProductCardCompact({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  
  const lowestPrice = productService.getProductPriceMin(product);
  const thumbnailUrl = productService.getThumbnail(product) || '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product._id}`} className="group block flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 h-full">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {!imageError && thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
            {product.name}
          </h4>
          <p className="text-green-700 font-bold text-base">
            {productService.formatPrice(lowestPrice)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="aspect-square bg-gray-100 animate-pulse" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProductSlider({ products, isLoading = false }: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.clientWidth / 4; // Scroll by 1 card width
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada produk di kategori ini
      </div>
    );
  }

  return (
    <div className="relative group/slider">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/slider:opacity-100 -translate-x-2 group-hover/slider:translate-x-0"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Products Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <ProductCardCompact key={product._id} product={product} />
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/slider:opacity-100 translate-x-2 group-hover/slider:translate-x-0"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
