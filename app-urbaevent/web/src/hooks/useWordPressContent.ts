/** Stub WordPress content hooks — fallback when WP API is not configured */
export function useWordPressArticles(_limit = 3) {
  return { data: [] as Array<Record<string, unknown>>, loading: false };
}

export function useWordPressMedia(_limit = 8) {
  return { data: [] as Array<Record<string, unknown>>, loading: false };
}
