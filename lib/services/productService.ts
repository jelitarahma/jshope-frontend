
import api from '../api';

export interface ProductVariant {
  _id: string;
  sku?: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  weight?: number;
  is_active?: boolean;
}

export interface ProductImage {
  _id?: string;
  product_id: string;
  variant_id?: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  category_id?: {
    _id: string;
    name: string;
  } | string;
  variants: ProductVariant[];

  thumbnail?: string;
  thumbnail_url?: string;
  product_images?: string[];
  images?: ProductImage[];
  video_url?: string;

  price_min?: number;
  price_max?: number;
  total_stock?: number;
  variant_count?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse | Product[]> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    const response = await api.get(`/product?${params.toString()}`);
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/product/${id}`);
    const data = response.data;

    if (data.product) {
        console.log('Unwrapping nested product response', { 
            name: data.product.name, 
            hasVariants: !!data.variants,
            hasImages: !!data.images 
        });
        
        return {
            ...data.product,
            variants: data.variants || [],
            images: data.images || []
        };
    }

    return data;
  },

  async createProduct(formData: FormData): Promise<Product> {
    const response = await api.post('/product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const response = await api.put(`/product/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/product/${id}`);
  },

  getLowestPrice(variants: ProductVariant[]): number {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => v.price));
  },

  getHighestPrice(variants: ProductVariant[]): number {
    if (!variants || variants.length === 0) return 0;
    return Math.max(...variants.map(v => v.price));
  },

  getTotalStock(variants: ProductVariant[]): number {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + v.stock, 0);
  },


  getProductPriceMin(product: Product): number {
    if (product.price_min !== undefined) return product.price_min;
    return this.getLowestPrice(product.variants);
  },

  getProductPriceMax(product: Product): number {
    if (product.price_max !== undefined) return product.price_max;
    return this.getHighestPrice(product.variants);
  },

  getProductStock(product: Product): number {
    if (product.total_stock !== undefined) return product.total_stock;
    return this.getTotalStock(product.variants);
  },

  getProductVariantCount(product: Product): number {
    if (product.variant_count !== undefined) return product.variant_count;
    return product.variants?.length || 0;
  },

  getThumbnail(product: Product): string | undefined {
    const path = product.thumbnail_url || product.thumbnail;
    if (!path) return undefined;
    
    if (path.startsWith('http') || path.startsWith('//')) {
      if (path.includes('localhost')) {
          return path.replace('localhost', '127.0.0.1');
      }
      return path;
    }

    const baseUrl = 'http://127.0.0.1:5000'; 
    

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${cleanPath}`;
  },

  getCategoryName(product: Product): string {
    if (!product.category_id) return 'Uncategorized';
    if (typeof product.category_id === 'string') return 'Category';
    return product.category_id.name || 'Uncategorized';
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  },
};
