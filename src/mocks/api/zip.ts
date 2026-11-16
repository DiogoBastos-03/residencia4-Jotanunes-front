/** Monta um .zip mínimo (sem compressão) — só para o batch-download do mock devolver um arquivo de verdade. */

const TABELA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(dados: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of dados) c = (TABELA[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function montarZip(arquivos: ReadonlyArray<{ nome: string; conteudo: string }>): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let deslocamento = 0;

  for (const a of arquivos) {
    const nome = enc.encode(a.nome);
    const dados = enc.encode(a.conteudo);
    const crc = crc32(dados);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nomes em UTF-8
    local.setUint32(14, crc, true);
    local.setUint32(18, dados.length, true);
    local.setUint32(22, dados.length, true);
    local.setUint16(26, nome.length, true);
    partes.push(new Uint8Array(local.buffer), nome, dados);

    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, dados.length, true);
    c.setUint32(24, dados.length, true);
    c.setUint16(28, nome.length, true);
    c.setUint32(42, deslocamento, true);
    central.push(new Uint8Array(c.buffer), nome);
    deslocamento += 30 + nome.length + dados.length;
  }

  const tamanhoCentral = central.reduce((n, p) => n + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true);
  fim.setUint16(8, arquivos.length, true);
  fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tamanhoCentral, true);
  fim.setUint32(16, deslocamento, true);

  const todas = [...partes, ...central, new Uint8Array(fim.buffer)];
  const saida = new Uint8Array(new ArrayBuffer(todas.reduce((n, p) => n + p.length, 0)));
  let i = 0;
  for (const p of todas) {
    saida.set(p, i);
    i += p.length;
  }
  return saida;
}
