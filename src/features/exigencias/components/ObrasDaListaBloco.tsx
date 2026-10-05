import { BuildingOffice2Icon, TrashIcon } from '@heroicons/react/24/outline';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, BlockRow, Button, EmptyState, Heading, Mono, Stack, Text } from '@/shared/ui';
import { Link } from 'react-router';
import type { DetalheLista } from '../types';

const t = strings.pages.lista;

export function ObrasDaListaBloco({ detalhe, onRemover }: { detalhe: DetalheLista; onRemover: (obraId: string) => void }) {
  const tipo = strings.dominio.tipo[detalhe.lista.tipo];
  const outro = detalhe.lista.tipo === 'servico' ? strings.dominio.tipo.material : strings.dominio.tipo.servico;
  return (
    <Stack gap="sm" className="mt-2">
      <div>
        <Heading>{t.obrasTitle}</Heading>
        <Text size="support" tone="muted" className="mt-1">
          {t.obrasDescription(tipo, outro)}
        </Text>
      </div>
      {detalhe.obrasVinculadas.length === 0 ? (
        <EmptyState icon={BuildingOffice2Icon} title={t.obrasVazioTitle} description={t.obrasVazioDescription} />
      ) : (
        <ul className="rounded-control border border-border">
          {detalhe.obrasVinculadas.map(({ obra, unica }) => (
            <BlockRow key={obra.id} as="li" className="flex-wrap py-2.75">
              <Link to={paths.obra(obra.id)} className="focus-ring min-w-0 flex-1 rounded-control text-body font-medium hover:underline max-md:flex max-md:min-h-tap max-md:basis-full max-md:items-center">
                {obra.nome}
              </Link>
              <Mono className="w-20">{strings.dominio.codigoObra(obra.codigo)}</Mono>
              <Text as="span" size="support" tone="muted" className="w-55 max-md:w-auto max-md:flex-1">
                {strings.dominio.cidadeUf(obra.cidade, obra.uf)}
              </Text>
              <span className="w-27.5">
                <Badge status={obra.situacao} />
              </span>
              <Button
                variant="tertiary"
                size="sm"
                icon={TrashIcon}
                disabled={unica}
                title={unica ? t.removerUnica : undefined}
                aria-label={`${t.remover} — ${obra.nome}`}
                onClick={() => onRemover(obra.id)}
              >
                {unica ? t.removerUnica : t.remover}
              </Button>
            </BlockRow>
          ))}
        </ul>
      )}
    </Stack>
  );
}
