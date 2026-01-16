import { useCallback, useEffect, useRef } from 'react';

// Focus navigation utilities for TV mode and keyboard accessibility

export interface FocusableElement {
  id: string;
  element: HTMLElement;
  row: number;
  col: number;
}

export function useFocusNavigation(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean = true
) {
  const focusableElements = useRef<FocusableElement[]>([]);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [role="button"], a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.current = Array.from(elements).map((element, index) => {
      const rect = element.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      
      return {
        id: element.id || `focusable-${index}`,
        element,
        row: Math.floor((rect.top - containerRect.top) / 100),
        col: Math.floor((rect.left - containerRect.left) / 100),
      };
    });
  }, [containerRef]);

  const findNearestElement = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right'): HTMLElement | null => {
      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = focusableElements.current.findIndex(
        (f) => f.element === activeElement
      );

      if (currentIndex === -1) {
        return focusableElements.current[0]?.element || null;
      }

      const current = focusableElements.current[currentIndex];
      let candidates: FocusableElement[] = [];

      switch (direction) {
        case 'up':
          candidates = focusableElements.current.filter((f) => f.row < current.row);
          break;
        case 'down':
          candidates = focusableElements.current.filter((f) => f.row > current.row);
          break;
        case 'left':
          candidates = focusableElements.current.filter(
            (f) => f.row === current.row && f.col < current.col
          );
          if (candidates.length === 0) {
            // Wrap to previous row
            candidates = focusableElements.current.filter((f) => f.row < current.row);
          }
          break;
        case 'right':
          candidates = focusableElements.current.filter(
            (f) => f.row === current.row && f.col > current.col
          );
          if (candidates.length === 0) {
            // Wrap to next row
            candidates = focusableElements.current.filter((f) => f.row > current.row);
          }
          break;
      }

      if (candidates.length === 0) return null;

      // Find closest candidate
      const sorted = candidates.sort((a, b) => {
        const distA = Math.abs(a.row - current.row) + Math.abs(a.col - current.col);
        const distB = Math.abs(b.row - current.row) + Math.abs(b.col - current.col);
        return distA - distB;
      });

      return sorted[0]?.element || null;
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'Enter':
        case ' ':
          // Let the default behavior handle activation
          return;
        default:
          return;
      }

      event.preventDefault();
      updateFocusableElements();

      const nextElement = findNearestElement(direction);
      if (nextElement) {
        nextElement.focus();
      }
    },
    [enabled, findNearestElement, updateFocusableElements]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    updateFocusableElements();

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateFocusableElements();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resizeObserver.disconnect();
    };
  }, [enabled, handleKeyDown, updateFocusableElements, containerRef]);

  return {
    updateFocusableElements,
    focusFirst: () => {
      updateFocusableElements();
      focusableElements.current[0]?.element?.focus();
    },
  };
}

// Hook for simple keyboard activation
export function useKeyboardActivation(
  onActivate: () => void,
  keys: string[] = ['Enter', ' ']
) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (keys.includes(event.key)) {
        event.preventDefault();
        onActivate();
      }
    },
    [onActivate, keys]
  );

  return { onKeyDown: handleKeyDown };
}
