'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { productService, Product, ProductVariant } from '@/lib/services/productService';
import { cartService } from '@/lib/services/cartService';
import Swal from 'sweetalert2';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        
        if (data.category_id) {
            const categoryId = typeof data.category_id === 'string' ? data.category_id : data.category_id._id;
            const related = await productService.getProducts({ category: categoryId, limit: 4 });
            if ('products' in related) {
                setRelatedProducts(related.products.filter(p => p._id !== data._id).slice(0, 4));
            } else {
                setRelatedProducts(related.filter(p => p._id !== data._id).slice(0, 4));
            }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        Swal.fire({
          icon: 'error',
          title: 'Product Not Found',
          text: 'The product you are looking for does not exist.',
        }).then(() => router.push('/products'));
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleAddToCart = async (isBuyNow = false) => {
    if (!selectedVariant) {
      Swal.fire({
        icon: 'warning',
        title: 'Select a Variant',
        text: 'Please select a product variant first.',
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to add items to your cart.',
        showCancelButton: true,
        confirmButtonText: 'Login',
        confirmButtonColor: '#f59e0b',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/auth?mode=login');
        }
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartService.addToCart(selectedVariant._id, quantity);
      
      if (isBuyNow) {
        router.push('/cart');
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${product?.name} has been added to your cart.`,
        showCancelButton: true,
        confirmButtonText: 'Go to Cart',
        cancelButtonText: 'Continue Shopping',
        confirmButtonColor: '#f59e0b',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/cart');
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add item to cart. Please try again.',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jshope-backend-phs3.vercel.app';
  const getImageUrl = (path?: string): string => {
    if (!path) return '/placeholder-product.png';
    let url = path;
    if (url.includes('localhost')) {
      url = url.replace('localhost', '127.0.0.1');
    }
    
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/${url}`;
  };
  const allImages = useMemo(() => {
     if (!product) return [];
     
     const images: { url: string; variantId?: string }[] = [];
     product.images?.forEach(img => {
         images.push({
             url: getImageUrl(img.image_url),
             variantId: img.variant_id
         });
     });
     product.variants?.forEach(v => {
        if (v.attributes) {
          Object.entries(v.attributes).forEach(([key, val]) => {
            if (typeof val === 'string' && (val.includes('/uploads') || val.startsWith('http') || key.includes('image'))) {
               const url = getImageUrl(val);
               const existing = images.find(i => i.url === url);
               
               if (!existing) {
                  images.push({ url, variantId: v._id });
               } else if (!existing.variantId) {
                  existing.variantId = v._id; 
               }
            }
          });
        }
     });

     if (images.length === 0) {
         if (product.thumbnail) images.push({ url: getImageUrl(product.thumbnail), variantId: undefined });
         else if (product.thumbnail_url) images.push({ url: getImageUrl(product.thumbnail_url), variantId: undefined });
     }
     
     return images;
  }, [product]);

  const uniqueGalleryImages = useMemo(() => {
      return Array.from(new Set(allImages.map(i => i.url)));
  }, [allImages]);
  
  const images = uniqueGalleryImages; 
  
  const currentMainImage = images[activeImage] || images[0] || '/placeholder-product.png';
  useEffect(() => {
    if (selectedVariant) {
        const variantImage = allImages.find(img => img.variantId === selectedVariant._id);
        if (variantImage) {
            const index = uniqueGalleryImages.indexOf(variantImage.url);
            if (index !== -1 && index !== activeImage) {
                setActiveImage(index);
            }
        }
    }
  }, [selectedVariant, allImages, uniqueGalleryImages, activeImage]);
  const getVariantDisplay = (variant: ProductVariant) => {
     const raw = variant.attributes && Object.keys(variant.attributes).length > 0
        ? Object.entries(variant.attributes)
            .filter(([k]) => k !== 'variant_0_images' && k !== 'variant_1_images' && k !== 'variant_2_images' && !k.includes('image'))
            .map(([k, v]) => `${v}`)
            .join(' / ')
        : variant.sku || 'Default';
     
     const parts = raw.split(' / ');
     return {
        name: parts[0],
        description: parts.length > 1 ? parts.slice(1).join(' / ') : null
     };
  };
  const setSyncedImage = (index: number) => {
    setActiveImage(index);

    const currentImgUrl = images[index];
     const isCurrentVariantValid = allImages.some(img => 
        img.url === currentImgUrl && img.variantId === selectedVariant?._id
     );

     if (isCurrentVariantValid) return;


     const imageOwners = allImages.filter(i => i.url === currentImgUrl && i.variantId);
     
     if (imageOwners.length > 0) {
        const newVariantId = imageOwners[0].variantId;
        if (newVariantId && newVariantId !== selectedVariant?._id) {
             const variantToSelect = product?.variants.find(v => v._id === newVariantId);
             if (variantToSelect) setSelectedVariant(variantToSelect);
        }
     }
  };
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = activeImage === 0 ? images.length - 1 : activeImage - 1;
    setSyncedImage(newIndex);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = activeImage === images.length - 1 ? 0 : activeImage + 1;
    setSyncedImage(newIndex);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
             <div className="aspect-square skeleton rounded-3xl" />
             <div className="space-y-6">
                <div className="h-10 skeleton w-3/4" />
                <div className="h-6 skeleton w-1/4" />
                <div className="h-32 skeleton" />
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-12 skeleton rounded-full" />
                    <div className="h-12 skeleton rounded-full" />
                </div>
                <div className="h-14 skeleton w-full rounded-full" />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = selectedVariant 
    ? selectedVariant.price 
    : productService.getLowestPrice(product.variants);
  const originalPrice = currentPrice * 1.2; // 20% markup mock
  const rating = 4.8;
  const reviewCount = 245;
  const currentVariantInfo = selectedVariant ? getVariantDisplay(selectedVariant) : null;

  return (
    <div className="min-h-screen bg-white text-stone-800">
      <div className="bg-stone-50 border-b border-stone-100">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/" className="text-stone-500 hover:text-stone-900 transition-colors">Home</Link>
            <span className="text-stone-300">/</span>
            <Link href="/products" className="text-stone-500 hover:text-stone-900 transition-colors">Shop</Link>
             <span className="text-stone-300">/</span>
             <span className="text-stone-500">{productService.getCategoryName(product)}</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6">
            <div className="relative aspect-square bg-stone-50 rounded-3xl overflow-hidden border border-stone-100 group">
              {images.length > 0 && !imageError ? (
                <Image
                  src={currentMainImage}
                  alt={product.name || 'Product Image'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={() => setImageError(true)}
                  priority
                  unoptimized={currentMainImage.startsWith('http://127.0.0.1') || currentMainImage.includes('localhost')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
               {selectedVariant?.stock === 0 && (
                 <div className="absolute top-4 right-4 bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                   Out of Stock
                 </div>
               )}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSyncedImage(index)}
                    className={`
                      relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all
                      ${activeImage === index ? 'border-amber-500 ring-2 ring-amber-100' : 'border-transparent hover:border-stone-200'}
                    `}
                  >
                     <Image 
                        src={img.startsWith('http') ? img : `${BASE_URL}${img}`} 
                        alt={`View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                        unoptimized={img.includes('127.0.0.1') || img.includes('localhost')}
                     />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                 <div className="flex text-yellow-400 text-sm">
                    {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                 </div>
                 <span className="text-sm text-stone-500 font-medium">{rating} ({reviewCount} Review)</span>
                 <span className="text-stone-300">|</span>
                 <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">In Stock</span>
              </div>
              <div className="flex items-end gap-3 py-2">
                 <span className="text-3xl font-bold text-stone-900 min-w-[max-content]">
                    {productService.formatPrice(currentPrice)}
                 </span>
                 <span className="text-lg text-stone-400 line-through mb-1">
                    {productService.formatPrice(originalPrice)}
                 </span>
              </div>

              {product.short_description && (
                <p className="text-stone-600 leading-relaxed text-lg">
                  {product.short_description}
                </p>
              )}
            </div>
            
            <div className="h-px bg-stone-100" />
            {product.variants.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    Select Variant
                    </label>
                    {currentVariantInfo?.description && (
                        <span className="text-xs text-stone-500 italic max-w-[60%] text-right truncate">
                            {currentVariantInfo.description}
                        </span>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                     const { name } = getVariantDisplay(variant);
                     const isSelected = selectedVariant?._id === variant._id;
                     const isOutOfStock = variant.stock === 0;
                     
                     return (
                        <button
                          key={variant._id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={isOutOfStock}
                          className={`
                            px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all min-w-[3rem]
                            ${isSelected 
                                ? 'border-amber-500 bg-amber-50 text-amber-900' 
                                : isOutOfStock
                                    ? 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed decoration-slice'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                            }
                          `}
                        >
                          {name}
                        </button>
                     );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center border-2 border-stone-200 rounded-xl bg-white h-14">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-full flex items-center justify-center text-stone-500 hover:text-amber-600 transition-colors"
                    >
                        -
                    </button>
                    <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 h-full text-center border-none focus:ring-0 font-bold text-stone-800"
                    />
                    <button 
                        onClick={() => setQuantity(Math.min(selectedVariant?.stock || 99, quantity + 1))}
                        className="w-12 h-full flex items-center justify-center text-stone-500 hover:text-amber-600 transition-colors"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={() => handleAddToCart(false)}
                    disabled={isAddingToCart || selectedVariant?.stock === 0}
                    className="flex-1 bg-stone-900 text-white h-14 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 px-8 shadow-lg shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                
                 <button
                    onClick={() => handleAddToCart(true)}
                    disabled={isAddingToCart || selectedVariant?.stock === 0}
                    className="flex-1 bg-amber-400 text-stone-900 h-14 rounded-xl font-bold hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 px-8 shadow-lg shadow-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Buy Now
                </button>

                <button className="w-14 h-14 border-2 border-stone-200 rounded-xl flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
            </div>
            <div className="pt-6 space-y-2 text-sm text-stone-500">
                <div className="flex gap-2 pb-1 pt-4">
                    <span className="font-semibold text-stone-900 min-w-[3rem]">SKU:</span>
                    <span>{selectedVariant?.sku || product.variants[0]?.sku || 'N/A'}</span>
                </div>
                <div className="flex gap-2 pb-1">
                    <span className="font-semibold text-stone-900 min-w-[3rem]">Tags:</span>
                    <span>Furniture, Modern, Chair, Office</span>
                </div>
                 <div className="flex gap-2 pb-1 items-center">
                    <span className="font-semibold text-stone-900 min-w-[3rem]">Share:</span>
                    <div className="flex gap-3">
                        {[
                            { name: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                            { name: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                            { name: 'Instagram', path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m0 2a3.8 3.8 0 00-3.8 3.8v8.4A3.8 3.8 0 007.8 20h8.4a3.8 3.8 0 003.8-3.8V7.8A3.8 3.8 0 0016.2 4H7.8z' }
                        ].map((social) => (
                             <button 
                                key={social.name} 
                                className="flex items-center justify-center hover:text-amber-600 transition-colors w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600" 
                                title={social.name}
                             >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" clipRule="evenodd" d={social.path} />
                                </svg>
                             </button>
                        ))}
                    </div>
                </div>
            </div>

          </div>
        </div>
        {/* Additional Information Section (Simplified) */}
        <div className="mt-5">
             <div className="flex items-center gap-4 mb-8">
                 <h2 className="text-2xl font-bold text-stone-900">Additional Information</h2>
                 <div className="h-px bg-stone-200 flex-1"></div>
             </div>

            <div className="max-w-4xl bg-stone-50 rounded-2xl p-8">
                 <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-stone-200">
                        <tr className="group">
                            <th className="py-2 font-semibold text-stone-900 w-1/3 pl-4">Weight</th>
                            <td className="py-2 text-stone-600">{product.variants[0]?.weight || 'N/A'} kg</td>
                        </tr>
                        <tr className="group">
                            <th className="py-2 font-semibold text-stone-900 w-1/3 pl-4">Dimensions</th>
                            <td className="py-2 text-stone-600">60 x 40 x 90 cm</td>
                        </tr>
                        <tr className="group">
                            <th className="py-2 font-semibold text-stone-900 w-1/3 pl-4">Materials</th>
                            <td className="py-2 text-stone-600">Premium Leather, Steel Alloy</td>
                        </tr>
                         <tr className="group">
                            <th className="py-2 font-semibold text-stone-900 w-1/3 pl-4">Description</th>
                            <td className="py-2 text-stone-600 leading-relaxed">{product.description || 'No description available'}</td>
                        </tr>
                    </tbody>
                 </table>
            </div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="mt-5 pb-5">
            <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                    <span className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                        <span className="w-8 h-px bg-amber-500"></span> Related Products
                    </span>
                    <h2 className="text-3xl font-bold text-stone-900 pb-3">Explore Related Products</h2>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                 const lowestPrice = productService.getProductPriceMin(p);
                 const thumbnailUrl = productService.getThumbnail(p) || '/placeholder-product.jpg';
                 const categoryName = productService.getCategoryName(p);

                 return (
                    <Link href={`/products/${p._id}`} key={p._id} className="group h-full block">
                      <div className="bg-white rounded-xl overflow-hidden border border-stone-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative w-full">
                         <div className="absolute top-3 left-3 z-10">
                            <span className="inline-block px-3 py-1 bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-100/50 backdrop-blur-sm">
                              {categoryName}
                            </span>
                         </div>
                        <div className="relative aspect-square bg-stone-50 overflow-hidden w-full">
                            <Image
                              src={thumbnailUrl}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized={thumbnailUrl.startsWith('http://127.0.0.1') || thumbnailUrl.includes('localhost')}
                            />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="text-lg font-bold text-stone-800 mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                            {p.name}
                          </h4>

                          <div className="mt-auto mb-0">
                            <p className="text-stone-900 font-bold text-xl">
                              {productService.formatPrice(lowestPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                 );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
