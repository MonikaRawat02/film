/**
 * Lazy Loading Image Component
 * Uses Intersection Observer API for efficient image loading
 */

import { useState, useRef, useEffect } from "react";
import { Film, ImageOff } from "lucide-react";

/**
 * LazyImage - Image component with lazy loading and placeholder
 */
export function LazyImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  aspectRatio = "auto", // "video" (16:9), "poster" (2:3), "square" (1:1), "auto"
  blur = true,
  fallbackIcon = "film",
  priority = false, // If true, loads immediately without lazy loading
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Set up Intersection Observer
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "200px 0px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  // Get aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video";
      case "poster":
        return "aspect-[2/3]";
      case "square":
        return "aspect-square";
      default:
        return "";
    }
  };

  // Get fallback icon
  const FallbackIcon = fallbackIcon === "film" ? Film : ImageOff;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${getAspectClass()} ${placeholderClassName}`}
    >
      {/* Placeholder/Loading state */}
      {(!isLoaded || !isInView) && !hasError && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Film className="w-6 h-6 text-zinc-700 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <FallbackIcon className="w-12 h-12 text-zinc-700" />
        </div>
      )}

      {/* Actual image */}
      {isInView && src && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`
            w-full h-full object-cover
            ${blur && !isLoaded ? "blur-sm scale-105" : "blur-0 scale-100"}
            transition-all duration-500 ease-out
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

/**
 * LazyBackgroundImage - Background image with lazy loading
 */
export function LazyBackgroundImage({
  src,
  children,
  className = "",
  overlayClassName = "",
  priority = false,
  onLoad,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef(null);

  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "100px 0px" }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Preload image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
  }, [isInView, src, onLoad]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Background */}
      <div
        className={`
          absolute inset-0 bg-cover bg-center bg-no-repeat
          transition-opacity duration-700
          ${isLoaded ? "opacity-100" : "opacity-0"}
        `}
        style={isInView && src ? { backgroundImage: `url(${src})` } : undefined}
      />

      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900" />
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClassName}`} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * LazyImageGrid - Optimized grid for multiple images
 */
export function LazyImageGrid({
  images,
  columns = 4,
  gap = 4,
  aspectRatio = "poster",
  renderItem,
  className = "",
}) {
  const getGridClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 4:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
      case 5:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
      case 6:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      default:
        return `grid-cols-${columns}`;
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-${gap} ${className}`}>
      {images.map((image, idx) =>
        renderItem ? (
          renderItem(image, idx)
        ) : (
          <LazyImage
            key={image.id || idx}
            src={image.src || image.coverImage || image.backdropImage}
            alt={image.alt || image.title || image.movieTitle || `Image ${idx + 1}`}
            aspectRatio={aspectRatio}
            className="rounded-xl"
          />
        )
      )}
    </div>
  );
}

/**
 * ProgressiveImage - Image that loads a low-res first, then high-res
 */
export function ProgressiveImage({
  lowResSrc,
  highResSrc,
  alt,
  className = "",
  aspectRatio = "auto",
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(lowResSrc);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  useEffect(() => {
    if (!highResSrc) return;

    const img = new Image();
    img.src = highResSrc;
    img.onload = () => {
      setCurrentSrc(highResSrc);
      setIsHighResLoaded(true);
    };
  }, [highResSrc]);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video";
      case "poster":
        return "aspect-[2/3]";
      case "square":
        return "aspect-square";
      default:
        return "";
    }
  };

  return (
    <div className={`relative overflow-hidden ${getAspectClass()}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`
          w-full h-full object-cover
          ${!isHighResLoaded ? "blur-md" : "blur-0"}
          transition-all duration-500
          ${className}
        `}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

/**
 * Hook: useInView - Check if element is in viewport
 */
export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenInView(true);
        }
      },
      {
        rootMargin: options.rootMargin || "0px",
        threshold: options.threshold || 0.1,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return { ref, isInView, hasBeenInView };
}

export default LazyImage;
