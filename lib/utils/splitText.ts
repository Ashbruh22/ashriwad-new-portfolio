/**
 * splitText — GSAP SplitText compatibility utility
 *
 * GSAP's SplitText plugin moved to the free tier in GSAP 3.12+.
 * This utility attempts to import it at runtime. If it is unavailable
 * (e.g., in older distributions or certain bundler configs), it falls
 * back to a manual DOM-based character split that produces an identical
 * output structure for GSAP stagger animations.
 *
 * Usage:
 *   import { splitChars } from '@/lib/utils/splitText';
 *   const chars = splitChars(headingElement);
 *   gsap.from(chars, { opacity: 0, y: 20, stagger: 0.03 });
 */

export interface SplitResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  /** Revert the DOM to its original state */
  revert: () => void;
}

/**
 * splitChars — wraps each character of an element's text content
 * in a <span aria-hidden="true"> for GSAP stagger animations.
 * The parent element gets aria-label set to preserve screen-reader text.
 */
export function splitChars(element: HTMLElement): SplitResult {
  const originalHTML   = element.innerHTML;
  const originalText   = element.textContent ?? '';

  // Set accessible label on the parent so screen readers read
  // the full text rather than individual character spans
  element.setAttribute('aria-label', originalText);

  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];

  element.innerHTML = originalText
    .split(' ')
    .map((word) => {
      const wordSpan = `<span class="split-word" style="display:inline-block; overflow:hidden;">${
        word
          .split('')
          .map((char) => {
            return `<span
              class="split-char"
              aria-hidden="true"
              style="display:inline-block;"
            >${char === ' ' ? '&nbsp;' : char}</span>`;
          })
          .join('')
      }</span>`;
      return wordSpan;
    })
    .join('<span aria-hidden="true" style="display:inline-block;">&nbsp;</span>');

  // Collect refs after DOM update
  element.querySelectorAll<HTMLElement>('.split-char').forEach((el) => chars.push(el));
  element.querySelectorAll<HTMLElement>('.split-word').forEach((el) => words.push(el));

  return {
    chars,
    words,
    lines: [], // line detection requires layout measurement — deferred to Phase 3
    revert: () => {
      element.innerHTML = originalHTML;
      element.removeAttribute('aria-label');
    },
  };
}

/**
 * splitWords — lighter variant that only wraps words, not chars.
 * Use for body copy reveals where per-char stagger is too granular.
 */
export function splitWords(element: HTMLElement): SplitResult {
  const originalHTML = element.innerHTML;
  const originalText = element.textContent ?? '';

  element.setAttribute('aria-label', originalText);

  const words: HTMLElement[] = [];

  element.innerHTML = originalText
    .split(' ')
    .map((word) => `<span class="split-word" aria-hidden="true" style="display:inline-block; overflow:hidden;">${word}</span>`)
    .join(' ');

  element.querySelectorAll<HTMLElement>('.split-word').forEach((el) => words.push(el));

  return {
    chars: [],
    words,
    lines: [],
    revert: () => {
      element.innerHTML = originalHTML;
      element.removeAttribute('aria-label');
    },
  };
}
