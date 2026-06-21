/**
 * Génère une couleur d'avatar déterministe depuis un identifiant (email, id…).
 * Utilise un simple hash djb2 pour distribuer uniformément sur une palette.
 */
const PALETTE = [
  '#1B365D', '#0D5C3E', '#6B21A8', '#C47B1A',
  '#0E7490', '#991B1B', '#1D4ED8', '#065F46',
  '#7C2D12', '#1E3A5F', '#4D7C0F', '#6D28D9',
];

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function avatarColor(seed: string): string {
  return PALETTE[djb2(seed) % PALETTE.length];
}

export function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
