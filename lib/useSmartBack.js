import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

/**
 * Smart back navigation hook
 * Falls back to a default route if no browser history exists
 * 
 * @param {string} fallbackUrl - URL to navigate to if no history (default: '/')
 * @returns {Function} - smartBack function
 */
export function useSmartBack(fallbackUrl = '/') {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(true);

  useEffect(() => {
    // Check if there's history to go back to
    // If window.history.length <= 1, there's no previous page
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  const smartBack = () => {
    if (canGoBack && window.history.length > 1) {
      // Go back if there's history
      router.back();
    } else {
      // Fallback to default URL
      router.push(fallbackUrl);
    }
  };

  return smartBack;
}

/**
 * Get intelligent fallback URL based on current route
 * @param {string} currentPath - Current pathname
 * @returns {string} - Appropriate fallback URL
 */
export function getFallbackUrl(currentPath) {
  if (!currentPath) return '/';

  // Movie pages → Homepage
  if (currentPath.startsWith('/movie/')) {
    return '/';
  }

  // Celebrity pages → Celebrities listing
  if (currentPath.startsWith('/celebrity/')) {
    return '/celebrities';
  }

  // Category pages → Homepage
  if (currentPath.startsWith('/category/')) {
    return '/';
  }

  // Intelligence pages → Intelligence listing
  if (currentPath.startsWith('/intelligence/')) {
    return '/intelligence';
  }

  // Box office → Homepage
  if (currentPath.startsWith('/box-office')) {
    return '/';
  }

  // OTT insights → Homepage or OTT category
  if (currentPath.startsWith('/ott-insights') || currentPath.startsWith('/ott/')) {
    return '/';
  }

  // Articles → Homepage
  if (currentPath.startsWith('/articles/')) {
    return '/';
  }

  // Admin pages → Admin dashboard
  if (currentPath.startsWith('/admin/')) {
    return '/admin/dashboard';
  }

  // Default fallback
  return '/';
}

export default useSmartBack;
