export interface ParsedArgs {
  command: string;
  options: Record<string, string>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [command = '', ...rest] = argv;
  const options: Record<string, string> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === undefined) {
      throw new Error('Unexpected end of arguments');
    }

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected token: ${token}`);
    }

    const key = token.slice(2);
    const value = rest[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    options[key] = value;
    index += 1;
  }

  return { command, options };
}
