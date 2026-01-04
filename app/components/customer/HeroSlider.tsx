// app/components/customer/HeroSlider.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
  imageUrl: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Discover Amazing Products',
    subtitle: 'New Collection 2024',
    description: 'Explore our curated selection of premium quality products at unbeatable prices.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    bgColor: 'from-amber-50 to-orange-50',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
  },
  {
    id: 2,
    title: 'Special Holiday Deals',
    subtitle: 'Up to 50% Off',
    description: 'Don\'t miss out on our biggest sale of the year. Limited time offer!',
    buttonText: 'View Deals',
    buttonLink: '/products',
    bgColor: 'from-rose-50 to-pink-50',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  },
  {
    id: 3,
    title: 'Quality Guaranteed',
    subtitle: 'Premium Selection',
    description: 'Every product is carefully selected to meet our high quality standards.',
    buttonText: 'Learn More',
    buttonLink: '/products',
    bgColor: 'from-green-50 to-emerald-50',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const slide = slides[currentSlide];

  return (
    <section className={`relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br ${slide.bgColor} overflow-hidden transition-colors duration-500`}>
      <div className="absolute inset-0 hero-pattern opacity-60" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-amber-300/30 rounded-full blur-2xl animate-pulse-soft" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-orange-300/30 rounded-full blur-3xl animate-pulse-soft animation-delay-200" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-rose-300/20 rounded-full blur-2xl animate-float" />
      <div className="hidden lg:block absolute top-32 right-1/4 w-6 h-6 bg-amber-400 rounded-full animate-bounce-soft" />
      <div className="hidden lg:block absolute bottom-32 left-1/3 w-4 h-4 bg-rose-400 rounded-full animate-bounce-soft animation-delay-300" />
      <div className="hidden lg:block absolute top-1/2 right-10 w-5 h-5 bg-orange-400 rounded-full animate-bounce-soft animation-delay-500" />

      <div className="container-custom relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] lg:min-h-[700px] py-20">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <span
              className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-sm text-amber-600 text-sm font-semibold rounded-full mb-4 animate-fade-in-down"
              key={`subtitle-${currentSlide}`}
            >
              {slide.subtitle}
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 leading-tight mb-6 animate-fade-in-up"
              key={`title-${currentSlide}`}
            >
              {slide.title}
            </h1>
            <p
              className="text-lg text-stone-600 mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up animation-delay-100"
              key={`desc-${currentSlide}`}
            >
              {slide.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-200">
              <Link
                href={slide.buttonLink}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5"
              >
                {slide.buttonText}
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-stone-700 font-semibold rounded-xl border-2 border-stone-200 hover:border-amber-300 hover:bg-white transition-all"
              >
                Browse All
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] animate-scale-in"
              key={`image-${currentSlide}`}
            >
              <div className="absolute inset-0 border-4 border-dashed border-amber-300/50 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-4 rounded-full overflow-hidden shadow-2xl shadow-amber-200/50">
                <div
                  className="w-full h-full bg-cover bg-center transform hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${slide.imageUrl})` }}
                />
              </div>

              <div className="absolute -bottom-2 -right-2 md:bottom-4 md:right-4 bg-white rounded-2xl px-4 py-3 shadow-xl animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Quality</p>
                    <p className="text-sm font-bold text-stone-800">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-600 transition-all shadow-lg z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-600 transition-all shadow-lg z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === currentSlide
                ? 'w-8 bg-amber-500'
                : 'bg-stone-300 hover:bg-stone-400'
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}
