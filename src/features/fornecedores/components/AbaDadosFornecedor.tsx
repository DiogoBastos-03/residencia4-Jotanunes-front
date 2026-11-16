import { formatCnpj, formatDate, formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, BadgeGroup, Card, Heading, KeyValueList, Mono } from '@/shared/ui';
import type { FichaCadastral } from '../types';

const t = strings.pages.fornecedor.dados;

/** Dados cadastrais como a API devolve (GET /enterprises/{id}). */
export function AbaDadosFornecedor({ ficha }: { ficha: FichaCadastral }) {
  const c = ficha.cadastro;
  return (
    <Card>
      <Heading>{t.title}</Heading>
      <KeyValueList
        className="mt-3"
        layout="stacked"
        items={[
          { key: 'razao', label: t.razao, value: c.razaoSocial, full: true },
          { key: 'cnpj', label: t.cnpj, value: <Mono>{formatCnpj(c.cnpj)}</Mono> },
          { key: 'situacao', label: t.situacao, value: <Badge status={c.bloqueado ? 'bloqueado' : 'ativo'} /> },
          { key: 'telefone', label: t.telefone, value: formatPhone(c.telefone) },
          { key: 'email', label: t.email, value: <span className="break-all">{c.email}</span> },
          { key: 'tipos', label: t.tipos, value: <BadgeGroup statuses={c.tipos} />, full: true },
          { key: 'desde', label: t.cadastradoEm, value: formatDate(c.desde, 'date') },
          { key: 'atualizado', label: t.atualizadoEm, value: formatDate(c.atualizadoEm, 'dateTime') },
        ]}
      />
    </Card>
  );
}
