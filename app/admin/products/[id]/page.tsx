// app/admin/products/[id]/page.tsx - Product Detail View
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productService, Product } from '@/lib/services/productService';
import SafeImage from '@/app/components/common/SafeImage';
import Swal from 'sweetalert2';

const baseURL = 'http://localhost:5000'; // Uploads are at root level, not /jshope

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  greenBg: '#E8F5E9',
  greenBorder: '#C8E6C9',
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<any[]>([]); // Store variants separately
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProductById(productId) as any;
      console.log('Product data:', data); // Debug log
      // API returns {product: {...}, variants: [...], images: [...]}
      const productData = data.product || data;
      const variantsData = data.variants || [];
      setProduct(productData);
      setVariants(variantsData);
    } catch (error) {
      console.error('Error fetching product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load product details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Product?',
      text: `Are you sure you want to delete "${product.name}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await productService.deleteProduct(productId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted',
          timer: 1500,
          showConfirmButton: false,
        });
        router.push('/admin/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete product',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${COLORS.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280' }}>Loading product details...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Product not found</p>
        <button
          onClick={() => router.push('/admin/products')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: COLORS.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Get product image - use thumbnail directly
  let mainImageUrl = '';
  if (product.thumbnail) {
    mainImageUrl = product.thumbnail.startsWith('http') 
      ? product.thumbnail 
      : `${baseURL}${product.thumbnail}`;
  }
  console.log('Main image URL:', mainImageUrl); // Debug
  
  const productImages = mainImageUrl ? [mainImageUrl] : [];
  console.log('Product images array:', productImages); // Debug
  
  // Get category name directly
  const categoryName = product.category_id && typeof product.category_id === 'object' 
    ? product.category_id.name 
    : 'Uncategorized';
  
  // Get price range - handle null price_max
  const priceMin = product.price_min || 0;
  const priceMax = product.price_max || priceMin; // Use priceMin if priceMax is null

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/admin/products')}
            style={{
              padding: '10px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              Product Details
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280' }}>
              {product.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push(`/admin/products/${productId}/edit`)}
            style={{
              padding: '10px 20px',
              backgroundColor: COLORS.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column - Images */}
        <div>
          {/* Main Image */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${COLORS.greenBorder}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <SafeImage
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Image Thumbnails */}
          {productImages.length > 1 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '16px',
              border: `1px solid ${COLORS.greenBorder}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                {productImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      aspectRatio: '1',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      border: selectedImage === idx ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                    }}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Basic Info */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${COLORS.greenBorder}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              {product.name}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Category</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  {categoryName}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Price Range</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: COLORS.primary }}>
                  {productService.formatPrice(priceMin)}
                  {priceMin !== priceMax && (
                    <span style={{ fontSize: '16px' }}>
                      {' '}- {productService.formatPrice(priceMax)}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Stock</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  {productService.getProductStock(product)} units
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</p>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '9999px',
                  backgroundColor: COLORS.greenBg,
                  color: COLORS.primary,
                }}>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${COLORS.greenBorder}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
                Description
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Variants Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${COLORS.greenBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          Product Variants ({variants?.length || 0})
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.greenBg }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>SKU</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Image</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Attributes</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Weight</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {variants && variants.length > 0 ? (
                variants.map((variant, idx) => (
                  <tr key={variant._id || idx} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>
                        {variant.sku || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {(() => {
                        // Find variant image from attributes
                        const variantImageKey = Object.keys(variant.attributes || {}).find(key => key.startsWith('variant_') && key.endsWith('_images'));
                        const variantImageUrl = variantImageKey ? variant.attributes[variantImageKey] : null;
                        
                        if (variantImageUrl) {
                          const fullUrl = variantImageUrl.startsWith('http') ? variantImageUrl : `${baseURL}${variantImageUrl}`;
                          return (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid #e5e7eb',
                              position: 'relative',
                              backgroundColor: '#f9fafb',
                            }}>
                              <SafeImage src={fullUrl} alt={variant.sku || 'Variant'} fill className="object-cover" />
                            </div>
                          );
                        }
                        return <span style={{ fontSize: '12px', color: '#9ca3af' }}>-</span>;
                      })()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {variant.attributes && Object.entries(variant.attributes)
                          .filter(([key]) => !(key.startsWith('variant_') && key.endsWith('_images')))
                          .map(([key, value]) => (
                          <span
                            key={key}
                            style={{
                              fontSize: '12px',
                              padding: '4px 10px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '6px',
                              color: '#374151',
                            }}
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                        {(!variant.attributes || Object.keys(variant.attributes).filter(key => !(key.startsWith('variant_') && key.endsWith('_images'))).length === 0) && (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Default</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.primary }}>
                        {productService.formatPrice(variant.price)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: variant.stock > 10 ? '#059669' : variant.stock > 0 ? '#d97706' : '#dc2626',
                      }}>
                        {variant.stock}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {variant.weight ? `${variant.weight}g` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        backgroundColor: variant.is_active ? COLORS.greenBg : '#f3f4f6',
                        color: variant.is_active ? COLORS.primary : '#6b7280',
                      }}>
                        {variant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No variants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
