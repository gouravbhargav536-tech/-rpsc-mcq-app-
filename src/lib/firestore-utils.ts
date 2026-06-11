/**
 * Sanitizes object data for Firestore by removing undefined values
 * and replacing them with null or default values to prevent "Unsupported field value: undefined" errors.
 */
export function sanitizeFirestoreData<T extends object>(data: T): T {
  const sanitized = { ...data } as any;

  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      sanitized[key] = null;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeFirestoreData(sanitized[key]);
    }
  });

  return sanitized;
}
