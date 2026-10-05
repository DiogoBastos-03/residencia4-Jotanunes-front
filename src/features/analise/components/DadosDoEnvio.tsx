import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Block, KeyValueList, Tag, Text, type KeyValueItem } from '@/shared/ui';
import type { DetalheEnvio } from '../types';

const t = strings.pages.analise.dados;

export function DadosDoEnvio({ detalhe }: { detalhe: DetalheEnvio }) {
  const comValidade = detalhe.exigido.item.validade === 'comData';
  const itens: KeyValueItem[] = [
    { key: 'fornecedor', label: t.fornecedor, value: detalhe.fornecedor.razaoSocial },
    {
      key: 'lista',
      label: t.lista,
      value: (
        <span className="flex flex-wrap items-center gap-1.5">
          <span>{detalhe.lista.nome}</span>
          <Badge status={detalhe.lista.tipo} />
        </span>
      ),
    },
    {
      key: 'obra',
      label: t.exigidoEm,
      value: (
        <>
          {detalhe.obraPrincipal.nome}{' '}
          <Text as="span" tone="faint">
            {strings.dominio.obrasExtras(detalhe.obrasExtras)}
          </Text>
        </>
      ),
    },
    { key: 'documento', label: t.documento, value: detalhe.exigido.nome },
    { key: 'tipo', label: t.tipo, value: <Tag kind={detalhe.exigido.obrigatoriedade} /> },
    ...(detalhe.renovacao ? [{ key: 'envio', label: t.renovacao, value: t.renovacaoTexto }] : []),
    {
      key: 'validade',
      label: t.validadeInformada,
      value: comValidade && detalhe.validadeInformada ? formatDate(detalhe.validadeInformada, 'date') : t.semValidade,
    },
    { key: 'enviado', label: t.enviadoEm, value: formatDate(detalhe.enviadoEm, 'dateTime') },
    { key: 'espera', label: t.espera, value: strings.dominio.espera(detalhe.esperaDias) },
  ];
  return (
    <Block title={t.title} padded>
      <KeyValueList items={itens} />
    </Block>
  );
}
