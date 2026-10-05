import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, Drawer, KeyValueList, Stack, type KeyValueItem } from '@/shared/ui';
import type { DetalheEnvioArquivos } from '../types';
import { DocumentPreview } from './DocumentPreview';

const t = strings.pages.envio.drawer;

type Props = {
  detalhe: DetalheEnvioArquivos;
  arquivoId: string | null;
  onClose: () => void;
  onAprovar: (id: string) => void;
  onReprovar: (id: string) => void;
};

/** Visualização de um arquivo, com a decisão dele. */
export function DrawerArquivo({ detalhe, arquivoId, onClose, onAprovar, onReprovar }: Props) {
  // Mantém o último arquivo durante a animação de saída.
  const ultimo = useRef<string | null>(null);
  if (arquivoId) ultimo.current = arquivoId;
  const item = detalhe.arquivos.find((a) => a.arquivo.id === (arquivoId ?? ultimo.current));
  const comValidade = detalhe.exigido.item.validade === 'comData';
  const a = item?.arquivo;
  const emAnalise = a?.status === 'emAnalise';

  const dados: KeyValueItem[] = a
    ? [
        { key: 'situacao', label: t.situacao, value: item && <Badge status={item.status} /> },
        ...(comValidade
          ? [{ key: 'validade', label: emAnalise ? t.validadeInformada : t.validade, value: formatDate((a.validade ?? a.validadeInformada) ?? detalhe.envio.enviadoEm, 'date') }]
          : []),
        { key: 'enviado', label: t.enviadoEm, value: formatDate(detalhe.envio.enviadoEm, 'dateTime') },
        { key: 'tamanho', label: t.tamanho, value: strings.dominio.tamanhoArquivo(a.tamanhoKb) },
        ...(a.decisao
          ? [{ key: 'decisao', label: t.decisao, value: strings.pages.envio.decididoPor(a.decisao.por, formatDate(a.decisao.em, 'dateTime')) }]
          : []),
        ...(a.decisao?.motivo ? [{ key: 'motivo', label: t.motivo, value: strings.dominio.motivos[a.decisao.motivo] }] : []),
        ...(a.decisao?.observacao ? [{ key: 'obs', label: t.observacao, value: a.decisao.observacao, full: true }] : []),
      ]
    : [];

  return (
    <Drawer
      open={arquivoId !== null && item !== undefined}
      onClose={onClose}
      title={a?.nome ?? ''}
      subtitle={t.subtitle(detalhe.exigido.nome, detalhe.fornecedor.razaoSocial)}
      footer={
        emAnalise && a ? (
          <>
            <Button icon={XCircleIcon} onClick={() => onReprovar(a.id)}>
              {strings.pages.envio.reprovar}
            </Button>
            <Button variant="primary" icon={CheckCircleIcon} onClick={() => onAprovar(a.id)}>
              {strings.pages.envio.aprovar}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>{t.fechar}</Button>
        )
      }
    >
      {a && (
        <Stack gap="lg">
          <div className="flex justify-center bg-surface-3 p-4">
            <DocumentPreview
              empresa={detalhe.fornecedor.razaoSocial}
              cnpj={detalhe.fornecedor.cnpj}
              titulo={detalhe.exigido.nome}
              enviadoEm={detalhe.envio.enviadoEm}
              pagina={1}
              paginas={1}
            />
          </div>
          <KeyValueList layout="stacked" items={dados} />
        </Stack>
      )}
    </Drawer>
  );
}
