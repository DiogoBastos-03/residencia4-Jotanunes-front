import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError, definirCenarioMock, observarRespostas, type RespostaObservada } from '@/shared/api';
import { env } from '@/shared/config/env';
import { cn, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Block, Button, InfoNote, Inline, Mono, PageHeader, Stack, Tag, Text } from '@/shared/ui';
import { estadoMockDeRede } from '@/mocks/api/estado';
import { ROTAS, SemDado, type Cenario, type Rota } from './cenarios';

const t = strings.pages.api;
const TOTAL = ROTAS.reduce((n, r) => n + r.cenarios.length, 0);

type Resultado =
  | { tipo: 'ok'; cenario: string; status: number | null; corpo: unknown; arquivo?: { url: string; nome: string } }
  | { tipo: 'erro'; cenario: string; erro: ApiError }
  | { tipo: 'semDado'; cenario: string; mensagem: string };

/** JSON legível (Blob vira "tipo — tamanho"). */
function mostrar(valor: unknown): string {
  if (valor === undefined) return t.semCorpo;
  return JSON.stringify(valor, (_k, v: unknown) => (v instanceof Blob ? `${v.type} — ${v.size} bytes` : v), 2);
}

function ehArquivo(v: unknown): v is { blob: Blob; nomeArquivo: string } {
  return typeof v === 'object' && v !== null && 'blob' in v && v.blob instanceof Blob && 'nomeArquivo' in v && typeof v.nomeArquivo === 'string';
}

const PRE = 'mt-1 max-h-80 overflow-auto rounded-control border border-border bg-surface-2 p-3 font-mono text-label whitespace-pre-wrap break-words text-ink-2';

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <Text size="label" weight="medium" tone="muted">
        {rotulo}
      </Text>
      {children}
    </div>
  );
}

function PainelResultado({ r }: { r: Resultado }) {
  if (r.tipo === 'semDado') {
    return (
      <Text size="support" tone="muted" className="mt-3">
        {r.cenario}: {r.mensagem}
      </Text>
    );
  }
  if (r.tipo === 'ok') {
    return (
      <div className="mt-3 flex flex-col gap-2 rounded-control border border-border p-3">
        <Inline gap="sm">
          <span className="rounded-badge bg-ok-bg px-1.5 py-0.5 text-label font-medium text-ok">{t.sucesso}</span>
          <Text size="support">{r.cenario}</Text>
          {r.status !== null && <Mono>{`${t.status} ${r.status}`}</Mono>}
        </Inline>
        <Campo rotulo={t.corpo}>
          <pre className={PRE}>{mostrar(r.corpo)}</pre>
        </Campo>
        {r.arquivo && (
          <a href={r.arquivo.url} download={r.arquivo.nome} className="focus-ring self-start rounded-control text-support font-semibold underline underline-offset-2">
            {t.baixar}: {r.arquivo.nome}
          </a>
        )}
      </div>
    );
  }
  const e = r.erro;
  return (
    <div className="mt-3 flex flex-col gap-2 rounded-control border border-border p-3">
      <Inline gap="sm">
        <span className="rounded-badge bg-danger-bg px-1.5 py-0.5 text-label font-medium text-danger">{t.erro}</span>
        <Text size="support">{r.cenario}</Text>
        <Mono>{`${t.status} ${e.status}`}</Mono>
        {e.code && <Mono>{`${t.code} ${e.code}`}</Mono>}
      </Inline>
      <Campo rotulo={t.mensagem}>
        <Text weight="medium">{e.mensagem}</Text>
      </Campo>
      <Campo rotulo={t.titleBack}>
        <Text size="support" tone="soft">
          {e.title}
        </Text>
      </Campo>
      {e.errors && (
        <Campo rotulo={t.errors}>
          <pre className={PRE}>{mostrar(e.errors)}</pre>
        </Campo>
      )}
    </div>
  );
}

function BlocoRota({ rota }: { rota: Rota }) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [rodando, setRodando] = useState<string | null>(null);
  const ultimoArquivo = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (ultimoArquivo.current) URL.revokeObjectURL(ultimoArquivo.current);
    },
    [],
  );

  async function executar(c: Cenario) {
    const rotulo = t.cenarios[c.chave];
    setRodando(c.chave);
    let status: number | null = null;
    const parar = observarRespostas((resp: RespostaObservada) => {
      status = resp.status;
    });
    definirCenarioMock(c.forcar ?? null);
    try {
      const corpo = await c.executar();
      if (ultimoArquivo.current) URL.revokeObjectURL(ultimoArquivo.current);
      const arquivo = ehArquivo(corpo) ? { url: URL.createObjectURL(corpo.blob), nome: corpo.nomeArquivo } : undefined;
      ultimoArquivo.current = arquivo?.url ?? null;
      setResultado({ tipo: 'ok', cenario: rotulo, status, corpo, arquivo });
    } catch (erro) {
      if (erro instanceof ApiError) setResultado({ tipo: 'erro', cenario: rotulo, erro });
      else if (erro instanceof SemDado) setResultado({ tipo: 'semDado', cenario: rotulo, mensagem: erro.message });
      else setResultado({ tipo: 'semDado', cenario: rotulo, mensagem: erro instanceof Error ? erro.message : String(erro) });
    } finally {
      definirCenarioMock(null);
      parar();
      setRodando(null);
    }
  }

  return (
    <Block
      title={
        <span className="flex flex-wrap items-baseline gap-x-2">
          <Mono className="text-support">{rota.metodo}</Mono>
          <span className="break-all font-mono text-support font-medium">{rota.caminho}</span>
        </span>
      }
      description={t.rotas[rota.chave]}
      padded
    >
      <div className="flex flex-wrap gap-2">
        {rota.cenarios.map((c) => (
          <Button key={c.chave} size="sm" disabled={rodando !== null} aria-busy={rodando === c.chave} onClick={() => void executar(c)}>
            {rodando === c.chave ? t.executando : t.cenarios[c.chave]}
            {c.forcar && <Tag kind="opcional">{t.forcado}</Tag>}
          </Button>
        ))}
      </div>
      {resultado && <PainelResultado r={resultado} />}
    </Block>
  );
}

/** Rota de verificação da camada de API: cada rota do contrato, com botões para cada cenário. */
export function ApiPage() {
  useDocumentTitle(t.title);
  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle(TOTAL)} />
      <InfoNote className={cn(!env.apiMock && 'border-warn')}>{env.apiMock ? t.modoMock : t.modoReal(env.apiUrl)}</InfoNote>
      {env.apiMock && estadoMockDeRede.viaFetch && (
        <AlertBox variant="warning" withIcon>
          {t.mockViaFetch(estadoMockDeRede.motivo ?? '')}
        </AlertBox>
      )}
      {ROTAS.map((rota) => (
        <BlocoRota key={rota.chave} rota={rota} />
      ))}
    </Stack>
  );
}
