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
 * Single Source of Truth for Experience Mode.
 * Returns one of:
 * - 'desktop': Standard desktop view (width >= 1200px or standard non-mobile viewport)
 * - 'tablet': Tablet view in landscape (700px <= width < 1200px, height > 500px)
 * - 'mobile-landscape': Compact view for mobile phones in landscape (height <= 500px)
 * - 'portrait-rotate': Rotate splash screen for touch devices in portrait
 */
export function getExperienceMode(width, height, isTouchDevice, hasCoarsePointer) {
  const isPortrait = height > width;
  const isLandscape = !isPortrait;

  // 1. Portrait touch device -> Must show Rotate Device screen
  if (isTouchDevice && isPortrait) {
    return 'portrait-rotate';
  }

  // 2. Mobile landscape: Touch/coarse device in landscape with short height (<= 500px)
  // or viewport height <= 500px on narrow screen (width <= 960px)
  if (isLandscape && height <= 500 && (hasCoarsePointer || isTouchDevice || width <= 960)) {
    return 'mobile-landscape';
  }

  // 3. Tablet landscape: Width 700px-1199px, height > 500px
  if (isLandscape && height > 500 && width < 1200 && width >= 700) {
    return 'tablet';
  }

  // 4. Desktop: Default for width >= 1200px and standard desktop viewports
  return 'desktop';
}

/**
 * Reliable orientation and device capability detection hook.
 * Distinguishes touch devices (phones/tablets) from desktop browsers.
 * Desktop users who resize windows into portrait will NOT be blocked.
 * Specifically isolates mobile landscape and tablet from desktop.
 */
export function useOrientation() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        experienceMode: 'desktop',
        isDesktop: true,
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
    const hasCoarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    const isTouchDevice = Boolean(hasTouch && hasCoarsePointer);

    const experienceMode = getExperienceMode(width, height, isTouchDevice, hasCoarsePointer);
    const isDesktop = experienceMode === 'desktop';
    const isLandscapePhone = experienceMode === 'mobile-landscape';
    const isTabletLandscape = experienceMode === 'tablet';
    const shouldShowRotateSplash = experienceMode === 'portrait-rotate';
    const isFullscreen = isFullscreenActive();

    return {
      experienceMode,
      isDesktop,
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
      const hasCoarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      const isTouchDevice = Boolean(hasTouch && hasCoarsePointer);

      const experienceMode = getExperienceMode(width, height, isTouchDevice, hasCoarsePointer);
      const isDesktop = experienceMode === 'desktop';
      const isLandscapePhone = experienceMode === 'mobile-landscape';
      const isTabletLandscape = experienceMode === 'tablet';
      const shouldShowRotateSplash = experienceMode === 'portrait-rotate';
      const isFullscreen = isFullscreenActive();

      setState({
        experienceMode,
        isDesktop,
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
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 60);
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    handleUpdate();

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return state;
}
