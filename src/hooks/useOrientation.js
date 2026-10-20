import { useState, useEffect } from 'react';

/**
 * Safe helper to check if document is in fullscreen mode.
 * Checks standard and webkit prefixed properties.
 */
export function isFullscreenActive() {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Safe helper to request fullscreen without throwing unhandled exceptions.
 */
export async function requestFullscreenSafe(element = (typeof document !== 'undefined' ? document.documentElement : null)) {
  if (!element) return false;
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
    }
    return true;
  } catch (err) {
    console.warn('Fullscreen request rejected or not supported on this device/browser:', err);
    return false;
  }
}

/**
 * Safe helper to exit fullscreen.
 */
export async function exitFullscreenSafe() {
  if (typeof document === 'undefined') return false;
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
    }
    return true;
  } catch (err) {
    console.warn('Exit fullscreen rejected:', err);
    return false;
  }
}

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
        isFullscreen: false,
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
    const isFullscreen = isFullscreenActive();

    return {
      isPortrait,
      isLandscape,
      isTouchDevice,
      isLandscapePhone,
      isTabletLandscape,
      shouldShowRotateSplash,
      isFullscreen,
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
      const isFullscreen = isFullscreenActive();

      setState({
        isPortrait,
        isLandscape,
        isTouchDevice,
        isLandscapePhone,
        isTabletLandscape,
        shouldShowRotateSplash,
        isFullscreen,
        width,
        height
      });
    };

    const handleFullscreenChange = () => {
      handleUpdate();
      // Ensure layout and Three.js resize listeners react to viewport changes
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 60);
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });
    document.addEventListener('fullscreenchange', handleFullscreenChange, { passive: true });
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange, { passive: true });

    // Also listen to visualViewport if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleUpdate, { passive: true });
    }

    handleUpdate();

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleUpdate);
      }
    };
  }, []);

  return state;
}

