import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { formatDate, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, ButtonLink, Card, Heading, Inline, Text } from '@/shared/ui';
import { rotaDaEntrada } from '../lib';
import type { DetalheEnvio } from '../types';

const t = strings.pages.analise.decidido;

/** Depois da decisão: o que foi decidido e para onde ir. */
export function PainelDecidido({ detalhe }: { detalhe: DetalheEnvio }) {
  const { decisao, documento, proximo } = detalhe;
  return (
    <Card>
      <Inline justify="between">
        <Heading>{t.title}</Heading>
        <Badge status={detalhe.status} />
      </Inline>
      {decisao && (
        <Text size="support" tone="muted" className="mt-3">
          {decisao.resultado === 'aprovado'
            ? t.aprovado(decisao.analista, formatDate(decisao.quando, 'time'))
            : t.reprovado(decisao.analista, formatDate(decisao.quando, 'time'))}{' '}
          {decisao.resultado === 'aprovado' && (documento.validade ? t.validoAte(formatDate(documento.validade, 'date')) : t.semValidade)}
          {decisao.motivo && t.motivo(strings.dominio.motivos[decisao.motivo])}
        </Text>
      )}
      {!proximo && (
        <Text size="support" tone="muted" className="mt-2">
          {t.filaVazia}
        </Text>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {proximo && (
          <ButtonLink to={rotaDaEntrada(proximo)} variant="primary" icon={ArrowRightIcon} className="flex-1">
            {t.proximo}
          </ButtonLink>
        )}
        <ButtonLink to={paths.fila} variant="secondary" className="flex-1">
          {t.voltar}
        </ButtonLink>
      </div>
    </Card>
  );
}
