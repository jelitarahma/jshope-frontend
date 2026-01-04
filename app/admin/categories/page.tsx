'use client';

import { useEffect, useState, useRef } from 'react';
import { categoryService, Category } from '@/lib/services/categoryService';
import Swal from 'sweetalert2';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  accentLight: '#FDD835',
};

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('beauty') || name.includes('cosmetic') || name.includes('kecantikan') || name.includes('skincare') || name.includes('makeup') || (name.includes('beauty') && name.includes('health'))) {
    return {
      icon: <span style={{ fontSize: '48px' }}>💄</span>,
      bgColor: '#FCE4EC',
      borderColor: '#F48FB1',
    };
  }
  
  if (name.includes('food') || name.includes('beverage') || name.includes('makanan') || name.includes('minuman') || name.includes('snack') || name.includes('drink') || (name.includes('food') && name.includes('beverage'))) {
    return {
      icon: <span style={{ fontSize: '48px' }}>🍔</span>,
      bgColor: '#FFF3E0',
      borderColor: '#FFCC80',
    };
  }
  
  if (name.includes('fashion') || name.includes('cloth') || name.includes('pakaian') || name.includes('baju') || name.includes('apparel') || name.includes('wear') || name.includes('sandang')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>👗</span>,
      bgColor: '#F3E5F5',
      borderColor: '#CE93D8',
    };
  }
  
  if (name.includes('furniture') || name.includes('furnitur') || name.includes('mebel') || name.includes('home') || name.includes('living') || name.includes('decor') || name.includes('rumah') || name.includes('tangga')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>🛋️</span>,
      bgColor: '#EFEBE9',
      borderColor: '#BCAAA4',
    };
  }
  
  if (name.includes('electronic') || name.includes('elektronik') || name.includes('gadget') || name.includes('tech') || name.includes('phone') || name.includes('laptop')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>💻</span>,
      bgColor: '#E3F2FD',
      borderColor: '#90CAF9',
    };
  }
  
  if (name.includes('sport') || name.includes('olahraga') || name.includes('fitness') || name.includes('gym')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>⚽</span>,
      bgColor: '#E8F5E9',
      borderColor: '#A5D6A7',
    };
  }
  
  if (name.includes('book') || name.includes('buku') || name.includes('education') || name.includes('stationery')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>📚</span>,
      bgColor: '#E0F2F1',
      borderColor: '#80CBC4',
    };
  }
  
  if (name.includes('health') || name.includes('kesehatan') || name.includes('medicine') || name.includes('pharmacy')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>⚕️</span>,
      bgColor: '#FFEBEE',
      borderColor: '#EF9A9A',
    };
  }
  
  if (name.includes('toy') || name.includes('mainan') || name.includes('game') || name.includes('kids')) {
    return {
      icon: <span style={{ fontSize: '48px' }}>🧸</span>,
      bgColor: '#FFF8E1',
      borderColor: '#FFE082',
    };
  }
  
  return {
    icon: <span style={{ fontSize: '48px' }}>📦</span>,
    bgColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({ name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let result = [...categories];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        cat => cat.name.toLowerCase().includes(query) || 
               (cat.description && cat.description.toLowerCase().includes(query))
      );
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredCategories(result);
  }, [categories, searchQuery, sortOrder]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat kategori. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = { name: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Nama kategori wajib diisi';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nama kategori minimal 2 karakter';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setFormErrors({ name: '' });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setFormErrors({ name: '' });
    setShowModal(true);
    setActiveMenu(null);
  };

  const openDetailModal = (category: Category) => {
    setViewingCategory(category);
    setActiveMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData.name.trim(), formData.description.trim());
        Swal.fire({ 
          icon: 'success', 
          title: 'Berhasil!', 
          text: 'Kategori berhasil diperbarui.',
          timer: 1500, 
          showConfirmButton: false 
        });
      } else {
        await categoryService.createCategory(formData.name.trim(), formData.description.trim());
        Swal.fire({ 
          icon: 'success', 
          title: 'Berhasil!', 
          text: 'Kategori baru berhasil dibuat.',
          timer: 1500, 
          showConfirmButton: false 
        });
      }
      setShowModal(false);
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error saving category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan kategori. Silakan coba lagi.';
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setActiveMenu(null);
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Kategori?',
      html: `Apakah Anda yakin ingin menghapus kategori <strong>"${category.name}"</strong>?<br/><small class="text-gray-500">Tindakan ini tidak dapat dibatalkan.</small>`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    });
    
    if (result.isConfirmed) {
      try {
        await categoryService.deleteCategory(category._id);
        Swal.fire({ 
          icon: 'success', 
          title: 'Terhapus!', 
          text: 'Kategori berhasil dihapus.',
          timer: 1500, 
          showConfirmButton: false 
        });
        fetchCategories();
      } catch (error: unknown) {
        console.error('Error deleting category:', error);
        const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus kategori. Mungkin kategori masih digunakan oleh produk.';
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: errorMessage
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
          Categories
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Total: <span style={{ color: COLORS.primary, fontWeight: '600' }}>{categories.length} kategori</span>
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '16px',
        marginBottom: '24px',
        padding: '16px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
          <svg 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '18px', 
              height: '18px', 
              color: '#9ca3af' 
            }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 44px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Urutkan:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              style={{
                padding: '8px 32px 8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px',
              }}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: COLORS.primary,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              boxShadow: '0 2px 4px rgba(27, 94, 32, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primaryLight;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Kategori
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
        gap: '20px' 
      }}>
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div 
              key={i} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '16px',
                  marginBottom: '16px',
                  animation: 'pulse 2s infinite',
                }} />
                <div style={{ 
                  width: '70%', 
                  height: '20px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '6px',
                  marginBottom: '8px',
                  animation: 'pulse 2s infinite',
                }} />
                <div style={{ 
                  width: '50%', 
                  height: '14px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '4px',
                  animation: 'pulse 2s infinite',
                }} />
              </div>
            </div>
          ))
        ) : filteredCategories.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '16px', 
              padding: '64px 32px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#E8F5E9', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}>
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#C8E6C9" stroke="#4CAF50" strokeWidth="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#FFF9C4" stroke="#FDD835" strokeWidth="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#FFF9C4" stroke="#FDD835" strokeWidth="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#C8E6C9" stroke="#4CAF50" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {searchQuery ? 'Kategori Tidak Ditemukan' : 'Belum Ada Kategori'}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                {searchQuery 
                  ? `Tidak ada kategori yang cocok dengan "${searchQuery}"`
                  : 'Mulai dengan membuat kategori pertama Anda'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={openCreateModal}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: COLORS.primary,
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Buat Kategori
                </button>
              )}
            </div>
          </div>
        ) : (

          filteredCategories.map((category) => {
            const { icon, bgColor, borderColor } = getCategoryIcon(category.name);
            
            return (
              <div
                key={category._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: `1px solid ${borderColor}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                }}
              >

                <div style={{ position: 'absolute', top: '16px', right: '16px' }} ref={activeMenu === category._id ? menuRef : null}>
                  <button
                    onClick={() => setActiveMenu(activeMenu === category._id ? null : category._id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activeMenu === category._id ? '#f3f4f6' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => {
                      if (activeMenu !== category._id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="12" cy="18" r="2"/>
                    </svg>
                  </button>
                  

                  {activeMenu === category._id && (
                    <div style={{
                      position: 'absolute',
                      top: '40px',
                      right: '0',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      minWidth: '140px',
                      zIndex: 50,
                    }}>
                      <button
                        onClick={() => openDetailModal(category)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Detail
                      </button>
                      <button
                        onClick={() => openEditModal(category)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '14px',
                          color: '#EF4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  )}
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: bgColor,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    {icon}
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#1f2937',
                    textAlign: 'center',
                    marginBottom: '4px',
                  }}>
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      textAlign: 'center',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4',
                    }}>
                      {category.description}
                    </p>
                  )}
                  
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af',
                    marginTop: category.description ? '0' : '8px',
                  }}>
                    {formatDate(category.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>


      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }} 
            onClick={() => setShowModal(false)} 
          />
          <div style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}>

            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                {editingCategory ? 'Edit Kategori' : 'Buat Kategori Baru'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {editingCategory ? 'Perbarui informasi kategori' : 'Tambahkan kategori baru untuk produk Anda'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Nama Kategori <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: `2px solid ${formErrors.name ? '#EF4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Contoh: Food & Beverage"
                  onFocus={(e) => {
                    if (!formErrors.name) {
                      e.target.style.borderColor = COLORS.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!formErrors.name) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {formErrors.name && (
                  <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '6px' }}>
                    {formErrors.name}
                  </p>
                )}
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Deskripsi <span style={{ color: '#9ca3af', fontWeight: '400' }}>(opsional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    height: '100px',
                    resize: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Deskripsi singkat tentang kategori ini..."
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#374151',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: isSubmitting ? '#9ca3af' : COLORS.primary,
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = COLORS.primaryLight;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = COLORS.primary;
                  }}
                >
                  {isSubmitting ? 'Menyimpan...' : editingCategory ? 'Perbarui' : 'Buat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {viewingCategory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }} 
            onClick={() => setViewingCategory(null)} 
          />
          <div style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}>
            {/* Close Button */}
            <button
              onClick={() => setViewingCategory(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: getCategoryIcon(viewingCategory.name).bgColor,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                {getCategoryIcon(viewingCategory.name).icon}
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {viewingCategory.name}
              </h2>
              
              {viewingCategory.description && (
                <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                  {viewingCategory.description}
                </p>
              )}

              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '12px', 
                padding: '16px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Dibuat pada</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {formatDate(viewingCategory.createdAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Diperbarui</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {formatDate(viewingCategory.updatedAt)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setViewingCategory(null);
                    openEditModal(viewingCategory);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    backgroundColor: '#E8F5E9',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setViewingCategory(null);
                    handleDelete(viewingCategory);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#EF4444',
                    backgroundColor: '#FEF2F2',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
