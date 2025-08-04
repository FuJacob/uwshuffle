/**
 * Utility functions for rating color coding
 */

/**
 * Gets the CSS color class for a rating percentage
 * @param rating - Rating value (0-1 decimal)
 * @returns CSS color class name
 */
export const getRatingColorClass = (rating: number | undefined): string => {
  if (!rating || rating < 0 || rating > 1) {
    return ''; // No color for invalid/missing ratings
  }

  const percentage = rating * 100;

  if (percentage < 40) {
    return 'uwshuffle-rating-error'; // Red for <40%
  } else if (percentage >= 80) {
    return 'uwshuffle-rating-success'; // Green for 80%+
  } else if (percentage >= 40 && percentage < 65) {
    return 'uwshuffle-rating-warning'; // Warning color for 40-65%
  } else if (percentage >= 65 && percentage < 80) {
    return 'uwshuffle-rating-normal'; // Normal text for 65-80%
  }

  return '';
};

/**
 * Gets the CSS color style for a rating percentage
 * @param rating - Rating value (0-1 decimal)
 * @returns CSS color variable
 */
export const getRatingColorStyle = (rating: number | undefined): string => {
  if (!rating || rating < 0 || rating > 1) {
    return 'var(--color-text-primary)'; // Default color for invalid/missing ratings
  }

  const percentage = rating * 100;

  if (percentage < 40) {
    return 'var(--color-error)'; // Red for <40%
  } else if (percentage >= 80) {
    return 'var(--color-success)'; // Green for 80%+
  } else if (percentage >= 40 && percentage < 65) {
    return 'var(--color-warning)'; // Warning color for 40-65%
  } else if (percentage >= 65 && percentage < 80) {
    return 'var(--color-text-primary)'; // Normal text for 65-80%
  }

  return 'var(--color-text-primary)';
};