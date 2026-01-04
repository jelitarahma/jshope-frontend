
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productService, Product } from '@/lib/services/productService';
import { categoryService, Category } from '@/lib/services/categoryService';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  greenBg: '#E8F5E9',
  greenBorder: '#C8E6C9',
  cream: '#FAFAF5',
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


// Product Card Component
import { cartService } from '@/lib/services/cartService';
import Swal from 'sweetalert2';


function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const lowestPrice = productService.getProductPriceMin(product);
  const thumbnailUrl = productService.getThumbnail(product) || '/placeholder-product.jpg';
  const categoryName = productService.getCategoryName(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Unavailable',
        text: 'Product has no variants available',
      });
      return;
    }

    try {
      setIsAdding(true);
      await cartService.addToCart(product.variants[0]._id, 1);
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      
      Toast.fire({
        icon: 'success',
        title: 'Added to cart'
      });
      
      window.dispatchEvent(new Event('cart-updated'));
      
    } catch (error) {
      console.error('Add to cart error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to add item to cart',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="group h-full block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative w-full">
        
         <div className="absolute top-3 left-3 z-10">
            <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100/50 backdrop-blur-sm">
              {categoryName}
            </span>
         </div>

        <div className="relative aspect-square bg-gray-50 overflow-hidden w-full">
          {!imageError && thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
            {product.name}
          </h4>

          <div className="mt-auto mb-0">
            <p className="text-green-700 font-bold text-xl">
              {productService.formatPrice(lowestPrice)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getProducts({ limit: 6 }),
          categoryService.getCategories(),
        ]);
        
        const productList = Array.isArray(productsRes) 
          ? productsRes 
          : productsRes.products || [];
        const categoryList = Array.isArray(categoriesRes) 
          ? categoriesRes 
          : [];
          
        setProducts(productList);
        setCategories(categoryList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Pastikan backend berjalan di localhost:5000');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
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
                <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed font-medium bg-white/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none rounded-xl">
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 mt-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shop by Category
            </h2>
            <p className="text-gray-500 text-lg">
              Browse our wide range of categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center p-6 rounded-xl bg-gray-50">
                  <div className="w-16 h-16 bg-white rounded-full mb-3 animate-pulse" />
                  <div className="h-4 bg-white rounded w-20 animate-pulse" />
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.slice(0, 5).map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="flex flex-col items-center p-4 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-20 h-20 flex items-center justify-center mb-4 bg-transparent">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="text-sm tracking-widest font-bold text-gray-900 text-center uppercase font-sans">
                    {category.name}
                  </span>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">
                Belum ada kategori
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 mb-5" style={{ backgroundColor: COLORS.cream }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Our Best Sellers
              </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-semibold hover:opacity-80 transition-colors text-base mb-2"
              style={{ color: COLORS.primary }}
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Produk</h3>
                <p className="text-gray-500">Produk akan segera tersedia</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pt-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="relative bg-[#D3D3C8] overflow-hidden min-h-[450px] flex items-center group">
               <div className="absolute inset-0 z-0 opacity-100">
                 <Image 
                   src="https://cdn-mms.hktvmall.com/HKTV/mms/uploadProductImage/3eaf/a901/26b1/zTNngZzXKd20240720120928_515.png"
                   alt="Bean Bag"
                   fill
                   className="object-cover object-right"
                   sizes="(max-width: 768px) 100vw, 50vw"
                 />
               </div>
               <div className="relative z-10 p-5 max-w-[60%]">
                 <span className="inline-block bg-black text-white text-xs font-bold px-3 py-2 mb-4">Save 20%</span>
                 <h3 className="text-4xl font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                   Premium <br/> Quality Items
                 </h3>
                 <button className="mt-4 px-5 py-3 bg-[#8B5E3C] text-white font-semibold hover:bg-[#6e4b30] transition-colors">
                   Explore More
                 </button>
               </div>
            </div>

            <div className="relative overflow-hidden min-h-[300px] flex items-center">
               <div className="absolute right-0 top-0 bottom-0 w-1/3 h-full z-0">
                  <Image 
                     src="https://img.freepik.com/premium-photo/cheerful-asian-woman-using-smartphone-wireless-headphones-home_116547-52744.jpg"
                     alt="Woman on chair"
                     fill
                     className="object-cover"
                     sizes="(max-width: 768px) 100vw, 50vw"
                  />
               </div>
               <div className="relative z-10 p-10 w-2/3">
                  <h3 className="text-3xl font-medium text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Get Discount <span className="font-bold">25% Off</span>
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-xs">
                    Sign up for our newsletter and get 25% off your next purchase!
                  </p>
               </div>
            </div>

          </div>
        </div>
      </section>

      <section className="bg-white" style={{padding:'120px 0 90px 0'}}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6">

               <div className="bg-white p-5 flex flex-col justify-center">
                  <span className="text-[#8B5E3C] font-semibold mb-2">Up to 60% Offer</span>
                  <h3 className="text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                    End Of Season Sales
                  </h3>
                  
                  <div className="flex gap-4 mb-8">
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-1">02</div>
                        <div className="text-xs text-gray-500 uppercase">Days</div>
                     </div>
                     <div className="text-2xl font-bold text-gray-300">:</div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-1">05</div>
                        <div className="text-xs text-gray-500 uppercase">Hours</div>
                     </div>
                      <div className="text-2xl font-bold text-gray-300">:</div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-1">33</div>
                         <div className="text-xs text-gray-500 uppercase">Minutes</div>
                     </div>
                      <div className="text-2xl font-bold text-gray-300">:</div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-1">45</div>
                         <div className="text-xs text-gray-500 uppercase">Seconds</div>
                     </div>
                  </div>

                  <button className="self-start px-5 py-3 mt-3 bg-[#8B5E3C] text-white font-semibold hover:bg-[#6e4b30] transition-colors">
                     Shop Now
                  </button>
               </div>

               <div className="relative overflow-hidden min-h-[400px]">
                  <Image 
                     src="https://cdn.mos.cms.futurecdn.net/f6oRk29Wpj9AzezvUzveEX.jpg"
                     alt="Modern Living Room"
                     fill
                     className="object-cover"
                     sizes="(max-width: 768px) 100vw, 50vw"
                  />
               </div>

            </div>
         </div>
      </section>
    </div>
  );
}
