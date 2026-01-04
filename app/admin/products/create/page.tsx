// app/admin/products/create/page.tsx - Create Product with Multi-Step Form
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { categoryService, Category } from '@/lib/services/categoryService';
import { productService } from '@/lib/services/productService';
import SafeImage from '@/app/components/common/SafeImage';
import Swal from 'sweetalert2';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  greenBg: '#E8F5E9',
  greenBorder: '#C8E6C9',
};

// Form variant type
interface FormVariant {
  sku: string;
  attributes: { key: string; value: string }[];
  price: number;
  stock: number;
  weight: number;
  imageUrl: string;
  imageFile: File | null;
  useImageUrl: boolean;
}

const createEmptyVariant = (): FormVariant => ({
  sku: '',
  attributes: [{ key: '', value: '' }],
  price: 0,
  stock: 0,
  weight: 0,
  imageUrl: '',
  imageFile: null,
  useImageUrl: true,
});

export default function CreateProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect localhost
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    variants: [createEmptyVariant()],
    thumbnail_url: '',
    image_urls: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(!isLocalhost);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Variant management
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, createEmptyVariant()],
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length === 1) return;
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index: number, field: keyof FormVariant, value: unknown) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addAttribute = (variantIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].attributes.push({ key: '', value: '' });
    setFormData({ ...formData, variants: newVariants });
  };

  const removeAttribute = (variantIndex: number, attrIndex: number) => {
    const newVariants = [...formData.variants];
    if (newVariants[variantIndex].attributes.length === 1) return;
    newVariants[variantIndex].attributes = newVariants[variantIndex].attributes.filter((_, i) => i !== attrIndex);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateAttribute = (variantIndex: number, attrIndex: number, field: 'key' | 'value', value: string) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].attributes[attrIndex][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  // Validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name.trim()) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Product name is required' });
        return false;
      }
      if (!formData.category_id) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a category' });
        return false;
      }
    }
    if (step === 2) {
      for (const variant of formData.variants) {
        if (variant.price <= 0) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'All variants must have a price greater than 0' });
          return false;
        }
        if (variant.stock < 0) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Stock cannot be negative' });
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('short_description', formData.short_description);
      fd.append('category_id', formData.category_id);

      // Convert variants
      const apiVariants = formData.variants.map((v, idx) => {
        const attrs: Record<string, string> = {};
        
        // Add regular attributes
        v.attributes.forEach(attr => {
          if (attr.key && attr.value) {
            attrs[attr.key] = attr.value;
          }
        });

        // Add variant image URL to attributes if using URL
        if (v.useImageUrl && v.imageUrl) {
          attrs[`variant_${idx}_images`] = v.imageUrl;
        }

        return {
          sku: v.sku || undefined,
          attributes: attrs,
          price: v.price,
          stock: v.stock,
          weight: v.weight || undefined,
        };
      });

      fd.append('variants', JSON.stringify(apiVariants));

      // Handle main product image
      if (imageFile) {
        fd.append('product_images', imageFile);
      } else if (formData.thumbnail_url) {
        fd.append('thumbnail_url', formData.thumbnail_url);
      }

      // Handle variant image files
      formData.variants.forEach((v, idx) => {
        if (!v.useImageUrl && v.imageFile) {
          fd.append(`variant_${idx}_image`, v.imageFile);
        }
      });

      await productService.createProduct(fd);
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product created successfully',
        timer: 1500,
        showConfirmButton: false,
      });

      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => router.push('/admin/products')}
          style={{
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            Create New Product
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280' }}>
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: `1px solid ${COLORS.greenBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Variants & Pricing' },
            { num: 3, label: 'Review & Submit' },
          ].map((step, idx) => (
            <div key={step.num} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step.num ? COLORS.primary : '#e5e7eb',
                  color: currentStep >= step.num ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  marginBottom: '8px',
                }}>
                  {step.num}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: currentStep >= step.num ? COLORS.primary : '#9ca3af',
                }}>
                  {step.label}
                </span>
              </div>
              {idx < 2 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: currentStep > step.num ? COLORS.primary : '#e5e7eb',
                  marginBottom: '32px',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${COLORS.greenBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
      }}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              Basic Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief product description"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product description"
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Product Image
                </label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {isLocalhost && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseUrlInput(false);
                        setFormData({ ...formData, thumbnail_url: '' });
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: !useUrlInput ? COLORS.primary : '#f3f4f6',
                        color: !useUrlInput ? 'white' : '#6b7280',
                      }}
                    >
                      Upload File
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUseUrlInput(true);
                      setImageFile(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: useUrlInput ? COLORS.primary : '#f3f4f6',
                      color: useUrlInput ? 'white' : '#6b7280',
                    }}
                  >
                    Use Image URL
                  </button>
                </div>

                {!useUrlInput && isLocalhost ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px dashed #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                      }}
                    />
                    {imageFile && (
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {formData.thumbnail_url && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb',
                          position: 'relative',
                          backgroundColor: '#f9fafb',
                        }}>
                          <SafeImage src={formData.thumbnail_url} alt="Preview" fill className="object-cover" />
                        </div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Image preview</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Variants */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                Variants & Pricing
              </h2>
              <button
                type="button"
                onClick={addVariant}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: COLORS.primary,
                  backgroundColor: 'transparent',
                  border: `1px solid ${COLORS.primary}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                + Add Variant
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {formData.variants.map((variant, vIndex) => (
                <div
                  key={vIndex}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#374151' }}>
                      Variant {vIndex + 1}
                    </span>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(vIndex)}
                        style={{
                          padding: '6px',
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Attributes */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Attributes (e.g., Color, Size)
                      </label>
                      <button
                        type="button"
                        onClick={() => addAttribute(vIndex)}
                        style={{
                          fontSize: '12px',
                          color: COLORS.primary,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        + Add Attribute
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {variant.attributes.map((attr, aIndex) => (
                        <div key={aIndex} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Key (e.g., color)"
                            value={attr.key}
                            onChange={(e) => updateAttribute(vIndex, aIndex, 'key', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '13px',
                              outline: 'none',
                              backgroundColor: 'white',
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., Red)"
                            value={attr.value}
                            onChange={(e) => updateAttribute(vIndex, aIndex, 'value', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '13px',
                              outline: 'none',
                              backgroundColor: 'white',
                            }}
                          />
                          {variant.attributes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttribute(vIndex, aIndex)}
                              style={{
                                padding: '8px',
                                color: '#9ca3af',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SKU, Price, Stock, Weight */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                        SKU
                      </label>
                      <input
                        type="text"
                        placeholder="Auto"
                        value={variant.sku}
                        onChange={(e) => updateVariant(vIndex, 'sku', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'white',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                        Price *
                      </label>
                      <input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e) => updateVariant(vIndex, 'price', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'white',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={variant.stock || ''}
                        onChange={(e) => updateVariant(vIndex, 'stock', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'white',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                        Weight (g)
                      </label>
                      <input
                        type="number"
                        value={variant.weight || ''}
                        onChange={(e) => updateVariant(vIndex, 'weight', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'white',
                        }}
                      />
                    </div>
                  </div>

                  {/* Variant Image */}
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                      Variant Image *
                    </label>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {isLocalhost && (
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = [...formData.variants];
                            newVariants[vIndex].useImageUrl = false;
                            newVariants[vIndex].imageUrl = '';
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: !variant.useImageUrl ? COLORS.primary : '#f3f4f6',
                            color: !variant.useImageUrl ? 'white' : '#6b7280',
                          }}
                        >
                          Upload
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = [...formData.variants];
                          newVariants[vIndex].useImageUrl = true;
                          newVariants[vIndex].imageFile = null;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: variant.useImageUrl ? COLORS.primary : '#f3f4f6',
                          color: variant.useImageUrl ? 'white' : '#6b7280',
                        }}
                      >
                        URL
                      </button>
                    </div>

                    {!variant.useImageUrl && isLocalhost ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[vIndex].imageFile = e.target.files?.[0] || null;
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px dashed #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        {variant.imageFile && (
                          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                            Selected: {variant.imageFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="url"
                          value={variant.imageUrl}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[vIndex].imageUrl = e.target.value;
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          placeholder="https://example.com/variant-image.jpg"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '13px',
                            outline: 'none',
                            backgroundColor: 'white',
                          }}
                        />
                        {variant.imageUrl && (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid #e5e7eb',
                              position: 'relative',
                              backgroundColor: '#f9fafb',
                            }}>
                              <SafeImage src={variant.imageUrl} alt={`Variant ${vIndex + 1}`} fill className="object-cover" />
                            </div>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Preview</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              Review & Submit
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic Info Summary */}
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>Product Name:</span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{formData.name}</span>

                  <span style={{ color: '#6b7280', fontWeight: '500' }}>Category:</span>
                  <span style={{ color: '#1f2937' }}>
                    {categories.find(c => c._id === formData.category_id)?.name || 'N/A'}
                  </span>

                  {formData.short_description && (
                    <>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Short Desc:</span>
                      <span style={{ color: '#1f2937' }}>{formData.short_description}</span>
                    </>
                  )}

                  {formData.description && (
                    <>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Description:</span>
                      <span style={{ color: '#1f2937' }}>{formData.description}</span>
                    </>
                  )}
                </div>

                {/* Product Image Preview */}
                {(imageFile || formData.thumbnail_url) && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Product Image:</p>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      position: 'relative',
                      backgroundColor: '#f9fafb',
                    }}>
                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Product"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <SafeImage src={formData.thumbnail_url} alt="Product" fill className="object-cover" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Variants Summary */}
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>
                  Variants ({formData.variants.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.variants.map((variant, idx) => (
                    <div key={idx} style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#374151' }}>Variant {idx + 1}</span>
                        <span style={{ fontWeight: '700', color: COLORS.primary }}>
                          {productService.formatPrice(variant.price)}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', color: '#6b7280' }}>
                        <div>
                          <span style={{ fontSize: '11px' }}>Stock: </span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{variant.stock}</span>
                        </div>
                        {variant.weight > 0 && (
                          <div>
                            <span style={{ fontSize: '11px' }}>Weight: </span>
                            <span style={{ fontWeight: '600', color: '#374151' }}>{variant.weight}g</span>
                          </div>
                        )}
                        {variant.sku && (
                          <div>
                            <span style={{ fontSize: '11px' }}>SKU: </span>
                            <span style={{ fontWeight: '600', color: '#374151', fontFamily: 'monospace' }}>{variant.sku}</span>
                          </div>
                        )}
                      </div>
                      {variant.attributes.some(a => a.key && a.value) && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {variant.attributes.filter(a => a.key && a.value).map((attr, aIdx) => (
                            <span
                              key={aIdx}
                              style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                backgroundColor: COLORS.greenBg,
                                color: COLORS.primary,
                                borderRadius: '4px',
                                fontWeight: '600',
                              }}
                            >
                              {attr.key}: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Variant Image Preview */}
                      {(variant.imageFile || variant.imageUrl) && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Variant Image:</p>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb',
                            position: 'relative',
                            backgroundColor: '#f9fafb',
                          }}>
                            {variant.imageFile ? (
                              <img
                                src={URL.createObjectURL(variant.imageFile)}
                                alt={`Variant ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <SafeImage src={variant.imageUrl} alt={`Variant ${idx + 1}`} fill className="object-cover" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '40px',
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{
            padding: '12px 24px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 1 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>

        {currentStep < 3 ? (
          <button
            onClick={nextStep}
            style={{
              padding: '12px 32px',
              backgroundColor: COLORS.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '12px 32px',
              backgroundColor: COLORS.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
        )}
      </div>
    </div>
  );
}
