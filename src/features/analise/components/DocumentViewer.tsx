import { useState } from 'react';
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { Button, Icon, IconButton, Text, useToast } from '@/shared/ui';
import type { DetalheDocumento } from '../types';
import { DocumentPreview } from './DocumentPreview';

const t = strings.pages.analise.viewer;
const ZOOMS = [50, 75, 100, 125, 150, 200] as const;

/** Visualizador do arquivo enviado: páginas, zoom e download. */
export function DocumentViewer({ detalhe }: { detalhe: DetalheDocumento }) {
  const [pagina, setPagina] = useState(1);
  const [zoom, setZoom] = useState(2);
  const { showToast } = useToast();
  const pct = ZOOMS[zoom] ?? 100;

  return (
    <section
      aria-label={t.previewLabel(detalhe.exigido.nome)}
      className="flex min-w-0 flex-col overflow-hidden rounded-control border border-border"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-surface-2 px-3 py-2">
        <Icon icon={DocumentTextIcon} size={16} className="text-ink-3" />
        <Text as="span" size="support" weight="medium" className="min-w-0 truncate">
          {detalhe.arquivo}
        </Text>
        <Text as="span" size="label" tone="faint">
          {strings.dominio.tamanhoArquivo(detalhe.tamanhoKb)}
        </Text>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <IconButton icon={ChevronLeftIcon} label={t.paginaAnterior} size="sm" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)} />
            <Text as="span" size="label" tone="muted" className="tabular">
              {t.pagina(pagina, detalhe.paginas)}
            </Text>
            <IconButton
              icon={ChevronRightIcon}
              label={t.proximaPagina}
              size="sm"
              disabled={pagina >= detalhe.paginas}
              onClick={() => setPagina((p) => p + 1)}
            />
          </div>
          <div className="flex items-center overflow-hidden rounded-control border border-border-strong bg-surface">
            <IconButton icon={MagnifyingGlassMinusIcon} label={t.diminuirZoom} variant="ghost" size="sm" disabled={zoom <= 0} onClick={() => setZoom((z) => z - 1)} />
            <Text as="span" size="label" tone="muted" className="tabular flex h-7 w-11.5 items-center justify-center border-x border-border">
              {t.zoom(pct)}
            </Text>
            <IconButton
              icon={MagnifyingGlassPlusIcon}
              label={t.aumentarZoom}
              variant="ghost"
              size="sm"
              disabled={zoom >= ZOOMS.length - 1}
              onClick={() => setZoom((z) => z + 1)}
            />
          </div>
          <Button variant="tertiary" size="sm" icon={ArrowDownTrayIcon} onClick={() => showToast(t.baixado(detalhe.arquivo))}>
            {t.baixar}
          </Button>
        </div>
      </div>
      <div className="flex min-h-140 flex-1 justify-center overflow-auto bg-surface-3 p-5 max-lg:min-h-100 max-sm:p-3">
        <div className="w-full max-w-107.5 origin-top transition-transform" style={{ transform: `scale(${pct / 100})` }}>
          <DocumentPreview
            empresa={detalhe.fornecedor.razaoSocial}
            cnpj={detalhe.fornecedor.cnpj}
            titulo={detalhe.exigido.nome}
            enviadoEm={detalhe.enviadoEm}
            pagina={pagina}
            paginas={detalhe.paginas}
          />
        </div>
      </div>
    </section>
  );
}
