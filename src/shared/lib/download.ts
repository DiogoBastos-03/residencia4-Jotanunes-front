/** Gera um CSV (separado por ponto e vírgula, como o Excel em português espera) e baixa. */
export function baixarCsv(nomeArquivo: string, linhas: ReadonlyArray<ReadonlyArray<string | number>>): void {
  const escapar = (valor: string | number) => {
    const texto = String(valor);
    return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const conteudo = linhas.map((linha) => linha.map(escapar).join(';')).join('\n');
  const blob = new Blob(['﻿', conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
