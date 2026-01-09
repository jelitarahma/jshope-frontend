'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryService, Category } from '@/lib/services/categoryService';
import { productService, Product } from '@/lib/services/productService';
import saleImage from './assets/images/sale.jpg';

const COLORS = {
  primary: '#1B5E20',
  cream: '#FAFAF5',
  lightGreen: '#E8F5E9',
};

function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  const basePath = '/assets/kategori';
  const iconProps = { width: 40, height: 40, className: "w-10 h-10 object-contain" };

  if (name.includes('beauty') || name.includes('health') || name.includes('skin')) {
    return <Image src={`${basePath}/beauty-svgrepo-com.svg`} alt="Beauty" {...iconProps} />;
  }
  if (name.includes('fashion') || name.includes('cloth') || name.includes('wear')) {
    return <Image src={`${basePath}/fashion-svgrepo-com.svg`} alt="Fashion" {...iconProps} />;
  }
  if (name.includes('food') || name.includes('drink') || name.includes('beverage')) {
    return <Image src={`${basePath}/food-pizza-slice-svgrepo-com.svg`} alt="Food" {...iconProps} />;
  }
  if (name.includes('home') || name.includes('living') || name.includes('furniture')) {
    return <Image src={`${basePath}/home-living.svg`} alt="Home" {...iconProps} />;
  }
  if (name.includes('gadget') || name.includes('electronic') || name.includes('phone')) {
    return <Image src={`${basePath}/electronic-smartphone-communication-svgrepo-com.svg`} alt="Electronics" {...iconProps} />;
  }
  return <Image src={`${basePath}/default.svg`} alt="Category" {...iconProps} />;
}

// Compact Product Card for Home Page
function HomeProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const lowestPrice = productService.getProductPriceMin(product);
  const thumbnailUrl = productService.getThumbnail(product) || '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product._id}`} className="block group">
      <div className="bg-white overflow-hidden border hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50">
          {!imageError ? (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 16vw"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-2">
          <h6 className="text-xs font-medium text-gray-800 line-clamp-2 mt-2 mb-4 leading-tight group-hover:text-green-700 transition-colors">
            {product.name}
          </h6>
          <p className="text-sm font-bold text-green-700">
            {productService.formatPrice(lowestPrice)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function HomeProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-2 space-y-2">
        <div className="h-3 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getProducts({ limit: 20 })
        ]);
        
        const categoryList = Array.isArray(categoriesRes) ? categoriesRes : [];
        const productList = Array.isArray(productsRes) ? productsRes : productsRes.products || [];
        
        setCategories(categoryList);
        setAllProducts(productList);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProducts = allProducts.slice(0, 12);
  const dealProducts = allProducts.slice(0, 6);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      {/* ==================== HERO SECTION (UNCHANGED) ==================== */}
      <section className="relative bg-white overflow-hidden h-[700px] lg:h-[800px] w-full flex items-center justify-center">
        <div className="relative w-full max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute top-[15%] lg:top-[12%] left-[5%] lg:left-0 w-full z-0 pointer-events-none select-none text-left">
            <div className="relative inline-block">
              <h2 
                className="text-4xl md:text-6xl text-gray-900 absolute -top-6 md:-top-12 left-2 md:left-4 z-10 tracking-wide" 
                style={{ fontFamily: "'Playfair Display', serif", fontSize: '5vw' }}
              >
                Discover
              </h2>
              <h1 
                className="text-[18vw] lg:text-[220px] xl:text-[280px] font-bold leading-[0.8] tracking-tighter ml-[-5px] mb-2"
                style={{ color: COLORS.primary, fontFamily: "'Playfair Display', serif", fontSize: '14vw' }}
              >
                Everything
              </h1>
            </div>
          </div>
          <div className="absolute top-[55%] lg:top-[50%] left-[5%] lg:left-[2%] z-20 w-full max-w-md lg:max-w-lg">
            <div className="pt-5 lg:p-0">
              <p className="text-gray-600 text-base md:text-lg mb-5 leading-relaxed font-medium bg-white/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none rounded-xl">
                Welcome to JShope, your ultimate destination for everything you need. From trending fashion to the latest gadgets, we bring the world's best products right to your doorstep.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-3 text-white font-bold rounded-none hover:shadow-2xl text-base tracking-widest uppercase"
                style={{ backgroundColor: COLORS.primary }}
              >
                Buy Now
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 right-[-20%] lg:right-[-5%] w-[120%] lg:w-[75%] h-[65%] lg:h-[100%] z-10 pointer-events-none flex items-end justify-end">
            <div className="relative w-[80%] h-[80%] ml-auto">
              <Image
                src="/assets/landingpage.png"
                alt="Furniture Collection"
                fill
                className="object-contain object-bottom lg:object-right-bottom drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          </div>
        </div>
      </section>
      {/* ==================== END HERO SECTION ==================== */}

      {/* Featured Categories - Circular icons */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Featured Categories</h3>
            <Link href="/products" className="text-green-700 font-semibold hover:text-green-800 text-sm flex items-center gap-1">
              See All Deals
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="flex justify-between flex-wrap gap-y-6 gap-x-4 sm:gap-x-8 md:gap-x-12 lg:gap-x-16 max-w-4xl mx-auto">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-14 animate-pulse" />
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.slice(0, 6).map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="flex flex-col items-center group"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-2 bg-green-50 rounded-full border-2 border-transparent group-hover:border-green-300 group-hover:bg-green-100 transition-all shadow-sm">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-green-700 text-center max-w-[80px] truncate">
                    {category.name}
                  </span>
                </Link>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* Promotional Banners - Two Side by Side */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Banner 1 - Fashion */}
            <Link 
              href="/products?category=fashion"
              className="group relative overflow-hidden rounded-xl h-[200px] md:h-[250px] flex items-center"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <div className="relative z-10 p-5 max-w-[60%]">
                <p className="text-blue-600 text-xs font-semibold mb-1 uppercase tracking-wider">New Arrivals</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 leading-tight">
                  Trendy Fashion<br/>Collections
                </h3>
                <span 
                  className="inline-block mt-3 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all group-hover:shadow-lg bg-blue-600"
                >
                  Shop Now
                </span>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-[45%]">
                <Image
                  src="https://i.pinimg.com/1200x/3c/41/25/3c4125d9738030d89827095163c6c291.jpg"
                  alt="Fashion Collection"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="40vw"
                  unoptimized
                />
              </div>
            </Link>
            
            {/* Banner 2 - Electronics */}
            <Link 
              href="/products?category=electronics"
              className="group relative overflow-hidden rounded-xl h-[200px] md:h-[250px] flex items-center"
              style={{ backgroundColor: '#F3E5F5' }}
            >
              <div className="relative z-10 p-5 max-w-[60%]">
                <p className="text-purple-600 text-xs font-semibold mb-1 uppercase tracking-wider">Latest Tech</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 leading-tight">
                  Smart Gadgets<br/>& Accessories
                </h3>
                <span 
                  className="inline-block mt-3 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all group-hover:shadow-lg bg-purple-600"
                >
                  Discover Now
                </span>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-[45%]">
                <Image
                  src="https://i.pinimg.com/1200x/26/af/45/26af4543d55cbb8cafc2ed0228be2356.jpg"
                  alt="Electronics"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="40vw"
                  unoptimized
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-5" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wider mb-1">Top Picks</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Featured Products</h3>
            </div>
            <Link href="/products" className="text-green-700 font-semibold hover:text-green-800 text-sm flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {isLoading ? (
              [...Array(6)].map((_, i) => <HomeProductCardSkeleton key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <HomeProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-6 text-center text-gray-500 py-8">Belum ada produk</p>
            )}
          </div>
        </div>
      </section>

      {/* Special Offer Banner with Countdown */}
      <section className="py-5" style={{ backgroundColor: COLORS.lightGreen }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden h-[300px] md:h-[350px] flex items-center" style={{ backgroundColor: '#182074' }}>
            {/* Left side - Text content */}
            <div className="relative z-10 p-5 md:p-12 max-w-[40%] text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-white">
                Mega Sale Event
              </h3>
              <p className="text-blue-100 mb-6 text-sm md:text-base">
                Up to 50% Off on Selected Items - Don't Miss Out!
              </p>
              
              {/* Countdown Timer */}
              <div className="flex gap-3 mb-6">
                {[
                  { value: '30', label: 'Days' },
                  { value: '05', label: 'Hours' },
                  { value: '42', label: 'Mins' },
                  { value: '18', label: 'Secs' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-white/20">
                      <span className="text-2xl md:text-3xl font-bold text-white">{item.value}</span>
                    </div>
                    <span className="text-xs text-blue-100 uppercase tracking-widest font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right side - Image */}
            <div className="absolute right-0 top-0 bottom-0 w-[70%]">
              <Image
                src={saleImage}
                alt="Mega Sale"
                fill
                className="object-cover object-center"
                sizes="20vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#182074] via-[#182074]/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Deal of the Day Section */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wider mb-1">Today's Deal</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Deals of the Day</h3>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
              <span className="text-xs text-gray-500">Ends in:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-green-700 text-sm">
                <span className="bg-white px-2 py-1 rounded">05</span>
                <span>:</span>
                <span className="bg-white px-2 py-1 rounded">23</span>
                <span>:</span>
                <span className="bg-white px-2 py-1 rounded">47</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {isLoading ? (
              [...Array(6)].map((_, i) => <HomeProductCardSkeleton key={i} />)
            ) : dealProducts.length > 0 ? (
              dealProducts.map((product) => (
                <HomeProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500 py-8">Belum ada produk</p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
