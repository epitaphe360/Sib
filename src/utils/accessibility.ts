/**
 * Accessibility Utilities
 * Helpers for WCAG 2.1 AA compliance
 */

let idCounter = 0;

/**
 * Generate unique ID for form elements
 * Useful for linking labels with inputs
 *
 * @param prefix - Prefix for the ID (e.g., 'email', 'name')
 * @returns Unique ID string
 *
 * @example
 * const emailId = generateId('email'); // 'email-1'
 * <label htmlFor={emailId}>Email</label>
 * <input id={emailId} />
 */
export function generateId(prefix: string = 'field'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Create aria-describedby string from description and error IDs
 *
 * @param baseId - Base ID of the input
 * @param hasDescription - Whether description exists
 * @param hasError - Whether error exists
 * @returns aria-describedby string or undefined
 */
export function createAriaDescribedBy(
  baseId: string,
  hasDescription: boolean,
  hasError: boolean
): string | undefined {
  const ids: string[] = [];
  if (hasDescription) ids.push(`${baseId}-desc`);
  if (hasError) ids.push(`${baseId}-error`);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Screen reader only text CSS class
 * Hides content visually but keeps it accessible to screen readers
 */
export const srOnlyClass = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Keyboard event handler for custom interactive elements
 * @param event - Keyboard event
 * @param handlers - Object with handler functions for each key
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  handlers: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }
): void {
  const { key } = event;
  
  switch (key) {
    case KeyboardKeys.ENTER:
      handlers.onEnter?.();
      break;
    case KeyboardKeys.SPACE:
      event.preventDefault();
      handlers.onSpace?.();
      break;
    case KeyboardKeys.ESCAPE:
      handlers.onEscape?.();
      break;
    case KeyboardKeys.ARROW_UP:
      event.preventDefault();
      handlers.onArrowUp?.();
      break;
    case KeyboardKeys.ARROW_DOWN:
      event.preventDefault();
      handlers.onArrowDown?.();
      break;
    case KeyboardKeys.ARROW_LEFT:
      handlers.onArrowLeft?.();
      break;
    case KeyboardKeys.ARROW_RIGHT:
      handlers.onArrowRight?.();
      break;
    case KeyboardKeys.TAB:
      handlers.onTab?.();
      break;
    case KeyboardKeys.HOME:
      event.preventDefault();
      handlers.onHome?.();
      break;
    case KeyboardKeys.END:
      event.preventDefault();
      handlers.onEnd?.();
      break;
  }
}

/**
 * Keyboard event handler for custom interactive elements
 * Activates on Enter or Space key
 *
 * @param callback - Function to call when activated
 * @returns Keyboard event handler
 *
 * @example
 * <div
 *   role="button"
 *   tabIndex={0}
 *   onKeyDown={handleKeyboardActivation(handleClick)}
 * >
 */
export function handleKeyboardActivation(
  callback: () => void
): (e: React.KeyboardEvent) => void {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

/**
 * Check if element should be focusable
 *
 * @param disabled - Whether element is disabled
 * @param readOnly - Whether element is read-only
 * @returns tabIndex value
 */
export function getTabIndex(disabled: boolean = false, readOnly: boolean = false): number {
  if (disabled || readOnly) return -1;
  return 0;
}

/**
 * Create accessible error message
 *
 * @param fieldName - Name of the field with error
 * @param error - Error message
 * @returns Formatted error message
 */
export function createErrorMessage(fieldName: string, error: string): string {
  return `${fieldName}: ${error}`;
}

/**
 * ARIA live region announcer
 * Announces messages to screen readers
 *
 * @param message - Message to announce
 * @param politeness - 'polite' or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnlyClass;
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management helper
 * Moves focus to element and announces to screen reader
 *
 * @param elementId - ID of element to focus
 * @param message - Optional message to announce
 */
export function moveFocusTo(elementId: string, message?: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
    if (message) {
      announceToScreenReader(message);
    }
  }
}

/**
 * Create accessible button props
 * Returns object with all necessary accessibility props
 *
 * @param label - Accessible label
 * @param pressed - Whether button is pressed (toggle)
 * @param expanded - Whether content is expanded (accordion/dropdown)
 * @returns Object with aria props
 */
export function createAccessibleButtonProps(
  label: string,
  pressed?: boolean,
  expanded?: boolean
): {
  'aria-label': string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  role: string;
} {
  return {
    'aria-label': label,
    ...(pressed !== undefined && { 'aria-pressed': pressed }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    role: 'button'
  };
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Parse hex to RGB
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Calculate relative luminance according to WCAG formula
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values
  const normalize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  const rLinear = normalize(r);
  const gLinear = normalize(g);
  const bLinear = normalize(b);

  // Calculate luminance using WCAG formula
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    console.error('Invalid color format:', { foreground, background });
    return 0;
  }

  const fgLuminance = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Calculate contrast ratio
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate color contrast ratio
 * Checks if contrast meets WCAG standards
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ('AA' or 'AAA')
 * @param largeText - Whether this is large text (>=18pt regular or >=14pt bold)
 * @returns Whether contrast is sufficient
 */
export function hasValidContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  // WCAG contrast requirements
  if (level === 'AAA') {
    return largeText ? ratio >= 4.5 : ratio >= 7;
  } else {
    // AA level (default)
    return largeText ? ratio >= 3 : ratio >= 4.5;
  }
}

/**
 * Common ARIA roles
 */
export const AriaRoles = {
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  DIALOG: 'dialog',
  LINK: 'link',
  NAVIGATION: 'navigation',
  RADIO: 'radio',
  REGION: 'region',
  STATUS: 'status',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TOOLTIP: 'tooltip'
} as const;

/**
 * Common keyboard keys
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
} as const;
