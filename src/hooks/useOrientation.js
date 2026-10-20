import { useState, useEffect } from 'react';

/**
 * Reliable orientation and device capability detection hook.
 * Distinguishes touch devices (phones/tablets) from desktop browsers.
 * Desktop users who resize windows into portrait will NOT be blocked.
 * Specifically detects short-height landscape phones (height <= 500px).
 */
export function useOrientation() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        isPortrait: false,
        isLandscape: true,
        isTouchDevice: false,
        isLandscapePhone: false,
        isTabletLandscape: false,
        shouldShowRotateSplash: false,
        width: 1920,
        height: 1080
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isLandscape = !isPortrait;

    // Detect if device is fundamentally touch-oriented (phone or tablet)
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isTouchDevice = Boolean(hasTouch && hasCoarsePointer);

    // Short-height landscape phones (844x390, 852x393, 915x412, 932x430, etc.)
    const isLandscapePhone = isLandscape && height <= 500;
    const isTabletLandscape = isLandscape && height > 500 && height <= 850 && width <= 1200;

    // ONLY show rotate splash for mobile/tablet touch devices in portrait
    const shouldShowRotateSplash = isTouchDevice && isPortrait;

    return {
      isPortrait,
      isLandscape,
      isTouchDevice,
      isLandscapePhone,
      isTabletLandscape,
      shouldShowRotateSplash,
      width,
      height
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = !isPortrait;

      // Check touch capability
      const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const isTouchDevice = Boolean(hasTouch && hasCoarsePointer);

      // Short-height landscape phones (844x390, 852x393, 915x412, 932x430, etc.)
      const isLandscapePhone = isLandscape && height <= 500;
      const isTabletLandscape = isLandscape && height > 500 && height <= 850 && width <= 1200;

      // Only show rotate splash for mobile/tablet touch devices in portrait
      const shouldShowRotateSplash = isTouchDevice && isPortrait;

      setState({
        isPortrait,
        isLandscape,
        isTouchDevice,
        isLandscapePhone,
        isTabletLandscape,
        shouldShowRotateSplash,
        width,
        height
      });
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });

    // Also listen to visualViewport if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleUpdate, { passive: true });
    }

    handleUpdate();

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleUpdate);
      }
    };
  }, []);

  return state;
}
