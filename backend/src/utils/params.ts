export function paramId(value: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = parseInt(raw, 10);
  return isNaN(id) ? null : id;
}
