'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product, productService } from '@/lib/services/productService';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (variantId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const lowestPrice = productService.getProductPriceMin(product);
  const highestPrice = productService.getProductPriceMax(product);
  const hasMultiplePrices = lowestPrice !== highestPrice;
  const totalStock = productService.getProductStock(product);
  const isOutOfStock = totalStock === 0;

  const thumbnailUrl = productService.getThumbnail(product) || '/placeholder-product.jpg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0 && onAddToCart) {
      onAddToCart(product.variants[0]._id);
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="block h-full">
      <div
        className="product-card group relative overflow-hidden border border-stone-100 h-full flex flex-col bg-white rounded-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-stone-50 flex-shrink-0">
          {!imageError ? (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="product-image object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
              unoptimized={thumbnailUrl.includes('localhost') || thumbnailUrl.includes('127.0.0.1')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-100">
              <svg className="w-16 h-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {product.category_id && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-stone-600 rounded-full">
              {productService.getCategoryName(product)}
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-white text-stone-800 font-semibold rounded-lg text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {!isOutOfStock && onAddToCart && (
            <div
              className={`
                absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent
                transform transition-all duration-300
                ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
              `}
            >
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 bg-white text-stone-800 font-semibold rounded-xl hover:bg-amber-500 hover:text-white transition-colors text-sm"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h5 className="font-bold text-stone-800 mb-1 line-clamp-2 h-12 leading-6 text-base group-hover:text-amber-600 transition-colors overflow-hidden">
            {product.name}
          </h5>

          {product.short_description && (
            <p className="text-xs text-stone-500 mb-3 line-clamp-2 h-8 leading-4 overflow-hidden">
              {product.short_description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            <div>
              <span className="text-base font-bold text-amber-600">
                {productService.formatPrice(lowestPrice)}
              </span>
              {hasMultiplePrices && highestPrice > lowestPrice && (
                <span className="text-xs text-stone-400 ml-1">
                  - {productService.formatPrice(highestPrice)}
                </span>
              )}
            </div>

            {productService.getProductVariantCount(product) > 1 && (
              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                {productService.getProductVariantCount(product)} var
              </span>
            )}
          </div>

          {!isOutOfStock && totalStock <= 10 && (
            <p className="text-[10px] text-red-500 mt-1">
              Only {totalStock} left!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-6 skeleton w-1/3" />
      </div>
    </div>
  );
}
