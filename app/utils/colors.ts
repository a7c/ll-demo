// Generate distinct, readable colors for chunk pairs
export function generateChunkColors(count: number): string[] {
  const colors = [
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#10B981', // green
    '#F59E0B', // amber
    '#3B82F6', // blue
    '#EF4444', // red
    '#14B8A6', // teal
    '#F97316', // orange
    '#8B5A3C', // brown
    '#6366F1', // indigo
    '#84CC16', // lime
    '#06B6D4', // cyan
    '#A855F7', // violet
    '#F43F5E', // rose
    '#22D3EE', // sky
  ];
  
  // If we need more colors than we have, cycle through them
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

export function getColorWithOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
