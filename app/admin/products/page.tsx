'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { productService, Product } from '@/lib/services/productService';
import { categoryService, Category } from '@/lib/services/categoryService';
import SafeImage from '@/app/components/common/SafeImage';
import Swal from 'sweetalert2';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  greenBg: '#E8F5E9',
  greenBorder: '#C8E6C9',
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
      });
      
      const productList = Array.isArray(data) ? data : (data.products || []);
      const pages = Array.isArray(data) ? 1 : (data.totalPages || 1);
      
      setProducts(productList);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load products' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  const handleDelete = async (product: Product) => {
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
        await productService.deleteProduct(product._id);
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete product.' });
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Products</h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>Manage your product catalog</p>
          </div>
          <button
            onClick={() => router.push('/admin/products/create')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: COLORS.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(27, 94, 32, 0.3)',
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        padding: '20px', 
        marginBottom: '24px',
        border: `1px solid ${COLORS.greenBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <svg 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 44px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: `1px solid ${COLORS.greenBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.greenBg }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Product</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Price</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Stock</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Variants</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} className="animate-pulse" />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: '16px', width: '70%', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '8px' }} className="animate-pulse" />
                          <div style={{ height: '12px', width: '40%', backgroundColor: '#f3f4f6', borderRadius: '4px' }} className="animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}><div style={{ height: '16px', width: '80px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} className="animate-pulse" /></td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}><div style={{ height: '16px', width: '40px', backgroundColor: '#f3f4f6', borderRadius: '4px', margin: '0 auto' }} className="animate-pulse" /></td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}><div style={{ height: '16px', width: '30px', backgroundColor: '#f3f4f6', borderRadius: '4px', margin: '0 auto' }} className="animate-pulse" /></td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}><div style={{ height: '24px', width: '60px', backgroundColor: '#f3f4f6', borderRadius: '9999px', margin: '0 auto' }} className="animate-pulse" /></td>
                    <td style={{ padding: '16px 20px' }}><div style={{ height: '32px', width: '120px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginLeft: 'auto' }} className="animate-pulse" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', backgroundColor: COLORS.greenBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <svg style={{ width: '40px', height: '40px', color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>No Products Found</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Add your first product to get started</p>
                      <button
                        onClick={() => router.push('/admin/products/create')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: COLORS.primary,
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Add Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    {/* Product Info */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative', backgroundColor: '#f9fafb' }}>
                          <SafeImage
                            src={productService.getThumbnail(product)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {productService.getCategoryName(product)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.primary }}>
                        {productService.formatPrice(productService.getProductPriceMin(product))}
                      </span>
                      {productService.getProductPriceMin(product) !== productService.getProductPriceMax(product) && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>
                          - {productService.formatPrice(productService.getProductPriceMax(product))}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {productService.getProductStock(product)}
                      </span>
                    </td>

                    {/* Variants Count */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {productService.getProductVariantCount(product)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        backgroundColor: COLORS.greenBg,
                        color: COLORS.primary,
                      }}>
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => router.push(`/admin/products/${product._id}`)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f0f9ff',
                            color: '#0284c7',
                            fontSize: '13px',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: COLORS.greenBg,
                            color: COLORS.primary,
                            fontSize: '13px',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: `1px solid ${COLORS.greenBorder}`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                          }}
                        >
                          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid #f3f4f6', 
            display: 'flex', 
            justifyContent: 'center',
            gap: '8px',
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: currentPage === i + 1 ? COLORS.primary : 'white',
                  color: currentPage === i + 1 ? 'white' : '#374151',
                  border: currentPage === i + 1 ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: currentPage === i + 1 ? '600' : '400',
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
