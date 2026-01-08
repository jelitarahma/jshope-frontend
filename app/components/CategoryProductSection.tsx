'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/services/categoryService';
import { Product, productService } from '@/lib/services/productService';
import ProductSlider from './ProductSlider';

interface CategoryProductSectionProps {
  category: Category;
  limit?: number;
}

export default function CategoryProductSection({ category, limit = 8 }: CategoryProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await productService.getProducts({ 
          category: category._id, 
          limit 
        });
        
        const productList = Array.isArray(res) ? res : res.products || [];
        setProducts(productList);
      } catch (error) {
        console.error(`Error fetching products for category ${category.name}:`, error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category._id, limit]);

  // Don't render section if no products and not loading
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          {category.name}
        </h2>
        <Link
          href={`/products?category=${category._id}`}
          className="inline-flex items-center gap-1 text-green-700 font-semibold hover:text-green-800 transition-colors text-sm"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <ProductSlider products={products} isLoading={isLoading} />
    </section>
  );
}
