import type { DecisaoRegistrada, StatusDocumento } from '@/entities';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Card, Heading, Inline, KeyValueList, Text } from '@/shared/ui';

const t = strings.pages.analise.leitura;

type Props = {
  status: StatusDocumento;
  decisao: DecisaoRegistrada | undefined;
  /** Validade em vigor (documento aprovado). */
  validade: string | undefined;
  semValidade: boolean;
};

/** Modo leitura: quem decidiu, quando e por quê. Sem painel de decisão. */
export function PainelLeitura({ status, decisao, validade, semValidade }: Props) {
  const reprovado = status === 'reprovado';
  return (
    <Card>
      <Inline justify="between">
        <Heading>{t.title}</Heading>
        <Badge status={status} />
      </Inline>
      <Text size="support" tone="muted" className="mt-3">
        {decisao
          ? (reprovado ? t.reprovado : t.aprovado)(decisao.por, formatDate(decisao.em, 'date'), formatDate(decisao.em, 'time'))
          : t.semRegistro}{' '}
        {!reprovado &&
          (status === 'vencido' && validade
            ? t.venceu(formatDate(validade, 'date'))
            : validade
              ? t.validoAte(formatDate(validade, 'date'))
              : semValidade
                ? t.semValidade
                : '')}
      </Text>
      {decisao?.motivo && (
        <KeyValueList
          className="mt-3"
          items={[
            { key: 'motivo', label: t.motivo, value: strings.dominio.motivos[decisao.motivo] },
            ...(decisao.observacao ? [{ key: 'obs', label: t.observacao, value: decisao.observacao }] : []),
          ]}
        />
      )}
      <Text size="label" tone="faint" className="mt-3">
        {t.leituraNota}
      </Text>
    </Card>
  );
}
