/** pluralize(1, 'obra', 'obras') → "1 obra"; pluralize(3, 'obra', 'obras') → "3 obras". */
export function pluralize(count: number, singular: string, plural: string, withCount = true): string {
  const word = count === 1 ? singular : plural;
  return withCount ? `${count} ${word}` : word;
}
