import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { EmptyState, Stack, Text } from '@/shared/ui';
import type { FichaFornecedor } from '../types';
import { GrupoDocumentosTabela } from './GrupoDocumentosTabela';

const t = strings.pages.fornecedor.documentos;

export function AbaDocumentos({ ficha }: { ficha: FichaFornecedor }) {
  if (ficha.grupos.length === 0) return <EmptyState icon={DocumentTextIcon} title={t.vazioTitle} description={t.vazioDescription} />;
  const origem = { tipo: 'fornecedor' as const, id: ficha.fornecedor.id, aba: 'documentos' };
  return (
    <Stack gap="lg">
      <Text size="support" tone="muted">
        {t.intro}
      </Text>
      {ficha.grupos.map((grupo) => (
        <GrupoDocumentosTabela key={grupo.aplicavel.lista.id} grupo={grupo} origem={origem} />
      ))}
    </Stack>
  );
}
