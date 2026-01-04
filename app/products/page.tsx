
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { ProductCardSkeleton } from '../components/customer/ProductCard';
import { productService, Product, ProductFilters } from '@/lib/services/productService';
import { categoryService, Category } from '@/lib/services/categoryService';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ limit: 1000 }),
          categoryService.getCategories()
        ]);

        const productList = Array.isArray(productsData) ? productsData : (productsData.products || []);
        setAllProducts(productList);
        setCategories(categoriesData || []);
        const categoryParam = searchParams.get('category') || '';
        const searchParam = searchParams.get('search') || '';
        const minPriceParam = searchParams.get('minPrice') || '';
        const maxPriceParam = searchParams.get('maxPrice') || '';
        const pageParam = parseInt(searchParams.get('page') || '1');

        setSelectedCategory(categoryParam);
        setSearchQuery(searchParam);
        setPriceRange({ min: minPriceParam, max: maxPriceParam });
        setCurrentPage(pageParam);

      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [searchParams]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Only fetch if empty? Or always refetch on mount?
        if (allProducts.length === 0) {
            setIsLoading(true);
            const data = await productService.getProducts({ limit: 1000 });
            const list = Array.isArray(data) ? data : (data.products || []);
            setAllProducts(list);
            
            const cats = await categoryService.getCategories();
            setCategories(cats || []);
            setIsLoading(false);
        }
      } catch (e) { console.error(e); setIsLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
      const category = searchParams.get('category') || '';
      const search = searchParams.get('search') || '';
      const minPrice = searchParams.get('minPrice') || '';
      const maxPrice = searchParams.get('maxPrice') || '';
      const page = parseInt(searchParams.get('page') || '1');
      
      setSelectedCategory(category);
      setSearchQuery(search);
      setPriceRange({ min: minPrice, max: maxPrice });
      setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    let result = [...allProducts];

    // Filter by Search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    if (selectedCategory) {
        result = result.filter(p => {
             if (typeof p.category_id === 'object' && p.category_id !== null) {
                 return p.category_id._id === selectedCategory;
             }
             return p.category_id === selectedCategory;
        });
    }

    if (priceRange.min || priceRange.max) {
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        
        result = result.filter(p => {
            const pMin = productService.getProductPriceMin(p);
            return pMin >= min && pMin <= max;
        });
    }

    setFilteredProducts(result);
  }, [allProducts, searchQuery, selectedCategory, priceRange]);

  useEffect(() => {
     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
     const endIndex = startIndex + ITEMS_PER_PAGE;
     setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const customRouterPush = (params: Record<string, string>) => {
      const newParams = new URLSearchParams();
      if (params.category) newParams.set('category', params.category);
      if (params.search) newParams.set('search', params.search);
      if (params.minPrice) newParams.set('minPrice', params.minPrice);
      if (params.maxPrice) newParams.set('maxPrice', params.maxPrice);
      if (params.page && params.page !== '1') newParams.set('page', params.page);
      
      router.push(`/products?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    customRouterPush({ 
        category: selectedCategory, 
        search: searchQuery, 
        minPrice: priceRange.min, 
        maxPrice: priceRange.max,
        page: '1' 
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    customRouterPush({ 
        category: categoryId, 
        search: searchQuery, 
        minPrice: priceRange.min, 
        maxPrice: priceRange.max,
        page: '1' 
    });
  };

  const handlePriceFilter = () => {
    customRouterPush({ 
        category: selectedCategory, 
        search: searchQuery, 
        minPrice: priceRange.min, 
        maxPrice: priceRange.max,
        page: '1' 
    });
  };

  const clearFilters = () => {
      setSearchQuery('');
      setSelectedCategory('');
      setPriceRange({ min: '', max: '' });
      router.push('/products');
  };
  
  const handlePageChange = (page: number) => {
      customRouterPush({ 
        category: selectedCategory, 
        search: searchQuery, 
        minPrice: priceRange.min, 
        maxPrice: priceRange.max,
        page: page.toString()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      <div>
        <div className="container-custom pt-5 mb-3">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            Our Products
          </h1>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-2xl shadow-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-white/30 border border-stone-100"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-stone-400 hover:text-amber-500 transition-colors"
                onClick={handleSearch}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container-custom py-2 mb-5">
        <div className="flex flex-col lg:flex-row gap-8">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-stone-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <aside
            className={`
              w-full lg:w-72 flex-shrink-0 space-y-6
              ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}
            `}
          >
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800">Categories</h4>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`
                    w-full text-left px-2 mb-1 rounded-xl text-sm font-medium transition-colors
                    ${!selectedCategory ? 'bg-amber-100 text-amber-700' : 'text-stone-600 hover:bg-stone-50'}
                  `}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category._id)}
                    className={`
                      w-full text-left px-2 mb-1 rounded-xl text-sm font-medium transition-colors
                      ${selectedCategory === category._id ? 'bg-amber-100 text-amber-700' : 'text-stone-600 hover:bg-stone-50'}
                    `}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-3">
              <h4 className="font-bold text-stone-800 mb-2">Price Range</h4>
              <div className="flex gap-3 mb-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                onClick={handlePriceFilter}
                className="w-full py-2 bg-amber-500 text-white font-medium rounded hover:bg-amber-600 transition-colors text-sm"
              >
                Apply Filter
              </button>
            </div>
            <button
              onClick={clearFilters}
              className="w-full py-3 border-2 border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </aside>
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-stone-600">
                Showing <span className="font-semibold text-stone-800">{displayedProducts.length}</span> of <span className="font-semibold text-stone-800">{filteredProducts.length}</span> products
              </p>
            </div>
            {isLoading && allProducts.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {displayedProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">No Products Found</h3>
                <p className="text-stone-500 mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`
                      w-10 h-10 rounded-xl font-medium transition-colors
                      ${currentPage === i + 1
                        ? 'bg-amber-500 text-white'
                        : 'border border-stone-200 hover:bg-stone-50'
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
