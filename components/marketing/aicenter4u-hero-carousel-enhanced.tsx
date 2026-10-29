"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { aicenterHeroSlides, aicenterTrustIndicators } from "@/lib/aicenter-hero-slides";
import type { HeroSlideDoc } from "@/lib/schema";
import type { HeroSlide } from "@/components/marketing/hero-carousel";

interface AICenter4UHeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

const getAnimationClass = (type?: string) => {
  switch (type) {
    case "slide-up":
      return "animate-in slide-in-from-bottom-4";
    case "slide-left":
      return "animate-in slide-in-from-right-4";
    case "zoom":
      return "animate-in zoom-in-95";
    case "fade":
      return "animate-in fade-in";
    case "none":
      return "";
    default:
      return "animate-in fade-in";
  }
};

export function AICenter4UHeroCarousel({ 
  slides = aicenterHeroSlides, 
  autoPlayInterval = 6000 
}: AICenter4UHeroCarouselProps) {
  const publishedSlides = slides.filter(s => s.isPublished).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % publishedSlides.length);
  }, [publishedSlides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + publishedSlides.length) % publishedSlides.length);
  }, [publishedSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || publishedSlides.length <= 1) return;
    
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, goToNext, publishedSlides.length]);

  if (publishedSlides.length === 0) {
    return null;
  }

  const currentSlide = publishedSlides[currentIndex];
  const hasBackgroundImage = currentSlide.backgroundImage?.url;
  const animationClass = getAnimationClass(currentSlide.animation?.type);
  const animationDuration = currentSlide.animation?.duration || 500;
  const animationDelay = currentSlide.animation?.delay || 0;

  return (
    <section className="relative overflow-hidden text-white">
      {hasBackgroundImage ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url(${currentSlide.backgroundImage!.url})`,
            }}
          />
          {currentSlide.overlay?.enabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: currentSlide.overlay.color,
                opacity: (currentSlide.overlay.opacity || 50) / 100,
              }}
            />
          )}
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10" />
        </>
      )}
      
      <div className="relative py-20 md:py-32 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div 
            key={currentSlide.id} 
            className={cn(animationClass, "duration-500")}
            style={{
              animationDuration: `${animationDuration}ms`,
              animationDelay: `${animationDelay}ms`,
            }}
          >
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400 bg-amber-500/10">
              {currentSlide.badge}
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {currentSlide.headline}{" "}
              <span className="text-amber-400">{currentSlide.highlightedText}</span>
            </h1>

            <p className="mt-6 text-lg text-gray-300 md:text-xl max-w-2xl mx-auto">
              {currentSlide.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              {currentSlide.benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-400" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {currentSlide.leadMagnet?.enabled && currentSlide.leadMagnet.urgency && (
              <div className="mt-6">
                <Badge variant="destructive" className="text-sm px-4 py-2 animate-pulse">
                  <Clock className="h-4 w-4 mr-2" />
                  {currentSlide.leadMagnet.urgency}
                </Badge>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold" 
                asChild
              >
                <Link href={currentSlide.primaryCta.href}>
                  {currentSlide.primaryCta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 border-amber-400 text-amber-400 hover:bg-amber-400/20 hover:text-amber-300" 
                asChild
              >
                <Link href={currentSlide.secondaryCta.href}>
                  {currentSlide.secondaryCta.text}
                </Link>
              </Button>
            </div>
          </div>

          {publishedSlides.length > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => { goToPrev(); setIsAutoPlaying(false); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {publishedSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "bg-amber-400 w-8"
                        : "bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => { goToNext(); setIsAutoPlaying(false); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-6">Why Families Choose AICenter4U</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              {aicenterTrustIndicators.map((indicator) => (
                <div key={indicator.title} className="flex flex-col items-center text-center">
                  <span className="text-lg font-bold text-white">{indicator.title}</span>
                  <span className="text-xs text-gray-400">{indicator.subtitle}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
