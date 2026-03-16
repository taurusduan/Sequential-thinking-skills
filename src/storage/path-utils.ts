export function normalizeSessionName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const sanitized = trimmed
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || 'session';
}

export function resolveCollisionName(baseName: string, existingNames: Iterable<string>): string {
  const used = new Set(existingNames);

  if (!used.has(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (used.has(`${baseName}-${counter}`)) {
    counter += 1;
  }

  return `${baseName}-${counter}`;
}
