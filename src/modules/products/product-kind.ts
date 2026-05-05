const cakeCategories = new Set([
  'banh kem',
  'banh-kem',
  'bánh kem',
  'birthday',
  'birthday-cake',
  'cake',
  'custom-cake',
  'cupcake',
  'mousse',
  'seasonal',
  'signature',
  'wedding',
]);

function normalizeCategory(category?: string) {
  return category?.trim().toLowerCase();
}

export function isCakeCategory(category?: string) {
  const normalizedCategory = normalizeCategory(category);

  if (!normalizedCategory) {
    return false;
  }

  return cakeCategories.has(normalizedCategory);
}

export function requiresStock(category?: string) {
  return !isCakeCategory(category);
}
