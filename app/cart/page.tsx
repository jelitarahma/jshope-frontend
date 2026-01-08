'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cartService, CartItem } from '@/lib/services/cartService';
import { productService } from '@/lib/services/productService';
import Swal from 'sweetalert2';

const IMAGE_BASE_URL = 'https://jshope-backend-phs3.vercel.app';

interface CartItemWithCheck extends CartItem {
    is_checked?: boolean;
}


const getProductImage = (item: CartItem) => {
    const product = item.variant_id?.product_id;
    // @ts-ignore
    const img = product?.thumbnail || product?.thumbnail_url;
    
    if (img) {
        if (img.startsWith('http')) return img;
        const cleanPath = img.startsWith('/') ? img : `/${img}`;
        return `${IMAGE_BASE_URL}${cleanPath}`;
    }
    return '';
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to view your cart.',
        confirmButtonColor: '#f59e0b',
      }).then(() => router.push('/auth?mode=login'));
      return;
    }

    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      const items = Array.isArray(response) ? response : (response.items || []);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMutationResponse = async (response: any) => {
      let items: CartItemWithCheck[] | null = null;
      if (Array.isArray(response)) {
          items = response;
      } else if (response && Array.isArray(response.items)) {
          items = response.items;
      }

      if (items) {
          setCartItems(items);
      } else {
          await fetchCart();
      }
  };

  const handleIncrease = async (itemId: string) => {
    setProcessingItem(itemId);
    try {
      const response = await cartService.increaseQuantity(itemId);
      await handleMutationResponse(response);
    } catch (error) {
      console.error('Error increasing quantity:', error);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleDecrease = async (itemId: string) => {
    setProcessingItem(itemId);
    try {
      const response = await cartService.decreaseQuantity(itemId);
      await handleMutationResponse(response);
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleRemove = async (itemId: string) => {
      const result = await Swal.fire({
        title: 'Remove Item?',
        text: 'Are you sure you want to remove this item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Yes, remove it!'
      });

      if (result.isConfirmed) {
        setProcessingItem(itemId);
        try {
            const response = await cartService.removeFromCart(itemId);
            await handleMutationResponse(response);
            Swal.fire('Removed!', 'Item has been removed.', 'success');
        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setProcessingItem(null);
        }
      }
  };

  const handleToggleChecked = async (itemId: string) => {
      setCartItems(prev => prev.map(item => {
          if (item._id === itemId) {
             const newVal = !(item.is_checked ?? item.checked);
             return { ...item, checked: newVal, is_checked: newVal };
          }
          return item;
      }));

      try {
          const response = await cartService.toggleChecked(itemId);
          await handleMutationResponse(response);
      } catch (error) {
          console.error("Error toggling check", error);
          await fetchCart(); 
      }
  };
  const isItemChecked = (item: CartItemWithCheck) => item.is_checked ?? item.checked;
  
  const checkedItems = cartItems.filter(item => isItemChecked(item));
  const cartTotal = checkedItems.reduce((acc, item) => acc + (item.variant_id?.price || 0) * item.quantity, 0);

  const handleCheckout = () => {
    if (checkedItems.length === 0) {
      Swal.fire('No Items Selected', 'Please select items to checkout.', 'warning');
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
             <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 w-48 rounded" />
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="bg-white border-b border-gray-100 pt-5 pb-5">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <div className="text-sm text-gray-500">
                <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <span>Shopping Cart</span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        {cartItems.length === 0 ? (
          <div className="text-center py-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                 </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 bg-amber-400 p-4 text-sm font-semibold text-stone-900 items-center">
                        <div className="col-span-1 text-center">
                        </div>
                        <div className="col-span-5 text-left">Product</div>
                        <div className="col-span-2 text-center">Price</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {cartItems.map((item) => (
                             <div key={item._id} className="grid grid-cols-12 gap-1 p-6 items-center hover:bg-gray-50/50 transition-colors">
                                <div className="col-span-1 flex justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={!!isItemChecked(item)} 
                                        onChange={() => handleToggleChecked(item._id)}
                                        className="w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                                    />
                                </div>
                                <div className="col-span-5 flex items-center gap-4 py-2">
                                     <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative group">
                                         {getProductImage(item) ? (
                                            <img 
                                                src={getProductImage(item)}
                                                alt={item.variant_id?.product_id?.name || 'Product'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                         )}
                                     </div>

                                     <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm mb-1 truncate pr-4">
                                            {item.variant_id?.product_id?.name}
                                        </p>
                                        {item.variant_id?.attributes?.color && (
                                            <p className="text-xs text-gray-500">Color : {item.variant_id.attributes.color}</p>
                                        )}
                                     </div>
                                </div>
                                <div className="col-span-2 text-center text-sm font-medium text-gray-600">
                                    {productService.formatPrice(item.variant_id?.price || 0)}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden h-9">
                                        <button 
                                            onClick={() => handleDecrease(item._id)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
                                            disabled={processingItem === item._id || item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center text-sm font-semibold text-gray-900 border-x border-gray-100">
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => handleIncrease(item._id)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
                                            disabled={processingItem === item._id}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-1 text-right font-bold text-stone-900 text-sm md:text-base">
                                     {productService.formatPrice((item.variant_id?.price || 0) * item.quantity)}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                     <button 
                                        onClick={() => handleRemove(item._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Remove item"
                                     >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                </div>
                             </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center">
                        <button 
                            className="text-stone-800 text-sm font-semibold hover:underline decoration-amber-500 underline-offset-4"
                            onClick={() => setCartItems([])}
                        >
                            Clear Shopping Cart
                        </button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
                    <h3 className="font-bold text-gray-900 text-lg mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
                    
                    <div className="space-y-4 text-sm text-gray-600 mb-8">
                        <div className="flex justify-between">
                            <span>Items ({checkedItems.length})</span>
                            <span className="font-medium text-gray-900">{productService.formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>fee</span>
                            <span className="font-medium text-gray-900">Free</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Taxes</span>
                            <span className="font-medium text-gray-900">Calculated at checkout</span>
                        </div>
                         <div className="border-t border-dashed border-gray-200 my-4 pt-4">
                            <div className="flex justify-between text-base">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-amber-600 text-xl">{productService.formatPrice(cartTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={checkedItems.length === 0}
                        className="w-full p-2 bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                        Continue to Checkout
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
