import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Block, BlockRow, Text } from '@/shared/ui';
import type { DetalheEnvio } from '../types';

const t = strings.pages.analise.anteriores;

export function EnviosAnteriores({ detalhe }: { detalhe: DetalheEnvio }) {
  const envios = detalhe.documento.enviosAnteriores;
  return (
    <Block title={t.title}>
      {envios.length === 0 ? (
        <Text size="support" tone="muted" className="p-4">
          {t.vazio}
        </Text>
      ) : (
        <ul>
          {envios.map((envio) => (
            <BlockRow key={`${envio.arquivo}-${envio.enviadoEm}`} as="li" className="py-2.75">
              <div className="min-w-0 flex-1">
                <Text className="break-all">{envio.arquivo}</Text>
                <Text size="label" tone="faint" className="mt-0.5">
                  {formatDate(envio.enviadoEm, 'date')}
                  {detalhe.renovacao && envio.arquivo === detalhe.documento.arquivo && ` ${strings.common.separator} ${t.versaoAtual}`}
                </Text>
              </div>
              <Badge status={envio.resultado} />
            </BlockRow>
          ))}
        </ul>
      )}
    </Block>
  );
}
