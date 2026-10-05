import { strings } from '@/shared/strings';

/** Lê um valor desconhecido (corpo JSON) e devolve o tipo esperado, ou falha dizendo onde. */
export type Leitor<T> = (valor: unknown, caminho: string) => T;

export class RespostaInvalida extends Error {
  constructor(readonly caminho: string) {
    super(`${strings.api.respostaInvalida} (${caminho})`);
    this.name = 'RespostaInvalida';
  }
}

export type Objeto = { readonly [chave: string]: unknown };

export function objeto(valor: unknown, caminho: string): Objeto {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) throw new RespostaInvalida(caminho);
  return Object.fromEntries(Object.entries(valor));
}

export const texto: Leitor<string> = (valor, caminho) => {
  if (typeof valor !== 'string') throw new RespostaInvalida(caminho);
  return valor;
};

export const numero: Leitor<number> = (valor, caminho) => {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) throw new RespostaInvalida(caminho);
  return valor;
};

export const booleano: Leitor<boolean> = (valor, caminho) => {
  if (typeof valor !== 'boolean') throw new RespostaInvalida(caminho);
  return valor;
};

export function umDe<T extends string>(valores: readonly T[]): Leitor<T> {
  return (valor, caminho) => {
    const achado = valores.find((v) => v === valor);
    if (achado === undefined) throw new RespostaInvalida(caminho);
    return achado;
  };
}

export function listaDe<T>(item: Leitor<T>): Leitor<T[]> {
  return (valor, caminho) => {
    if (!Array.isArray(valor)) throw new RespostaInvalida(caminho);
    return valor.map((v: unknown, i) => item(v, `${caminho}[${i}]`));
  };
}

/** Lê o campo `chave` de um objeto já validado. */
export function campo<T>(obj: Objeto, chave: string, leitor: Leitor<T>, caminho: string): T {
  return leitor(obj[chave], `${caminho}.${chave}`);
}
