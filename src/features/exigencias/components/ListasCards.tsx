import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, CardLink, Inline, Text } from '@/shared/ui';
import type { LinhaLista } from '../types';

const t = strings.pages.exigencias;

/** Cada lista é um cartão clicável que abre a configuração. */
export function ListasCards({ linhas }: { linhas: readonly LinhaLista[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {linhas.map(({ lista, composicao, obras, alcance }) => (
        <li key={lista.id}>
          <CardLink to={paths.lista(lista.id)} padded={false} className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 p-4">
              <Inline gap="sm">
                <Text as="span" weight="semibold" className="text-block">
                  {lista.nome}
                </Text>
                <Badge status={lista.tipo} />
                <Badge status={lista.situacao} />
              </Inline>
              <Text tone="muted" className="mt-1.5">
                {lista.descricao}
              </Text>
              <Text size="support" tone="faint" className="mt-2">
                {strings.dominio.composicao(composicao.documentosObrigatorios, composicao.documentosOpcionais, composicao.documentosFuncionario)}
              </Text>
            </div>
            <div className="flex flex-col items-start gap-0.5 border-border p-4 max-lg:border-t lg:border-l">
              <Text weight="medium">{t.valeEm(obras)}</Text>
              <Text size="support" tone="muted">
                {t.alcanca(alcance, strings.dominio.tipo[lista.tipo])}
              </Text>
              <Text as="span" size="support" weight="semibold" className="row-affordance mt-auto pt-2">
                {t.configurar}
              </Text>
            </div>
          </CardLink>
        </li>
      ))}
    </ul>
  );
}
