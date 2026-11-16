import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useFornecedoresApi } from '@/entities/fornecedor';
import { useObrasApi, useVinculosApi } from '@/entities/obra';
import { useListasApi } from '@/entities/exigencias';
import { useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Block, BlockRowLink, Icon, InfoNote, Mono, PageHeader, Stack, Text } from '@/shared/ui';
import { montarCatalogo } from './catalogo';

const t = strings.pages.estados;

/** Lista de revisão: todo estado da aplicação, com link direto. */
export function EstadosPage() {
  useDocumentTitle(t.title);
  // Os exemplos (fornecedor, obra, bloqueado…) saem das respostas da API.
  const fornecedores = useFornecedoresApi();
  const obras = useObrasApi();
  const vinculos = useVinculosApi(obras.data?.itens);
  const f = fornecedores.data?.itens;
  const o = obras.data?.itens;
  const v = vinculos.data;
  const listaId = useListasApi().data?.itens[0]?.id ?? null;
  const catalogo = useMemo(() => montarCatalogo({ fornecedores: f ?? [], obras: o ?? [], vinculos: v ?? [], listaId }), [f, o, v, listaId]);
  const carregando = !f || !o || !v;
  const total = catalogo.reduce((n, g) => n + g.entradas.length, 0);
  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle(total)} />
      {carregando && <InfoNote>{t.carregando}</InfoNote>}
      {catalogo.map((grupo) => (
        <Block key={grupo.chave} title={t.grupos[grupo.chave]}>
          <ul>
            {grupo.entradas.map((entrada) => {
              const [nome, descricao, caminho] = t.estados[entrada.chave];
              return (
                <li key={entrada.chave}>
                  <BlockRowLink to={entrada.para}>
                    <div className="min-w-0 flex-1">
                      <Text weight="medium">{nome}</Text>
                      <Text size="support" tone="muted" className="mt-0.5">
                        {descricao} {t.caminho} {caminho}
                      </Text>
                    </div>
                    <Mono className="max-w-80 truncate max-md:hidden">{entrada.para}</Mono>
                    <Icon icon={ChevronRightIcon} size={16} className="row-affordance" />
                  </BlockRowLink>
                </li>
              );
            })}
          </ul>
        </Block>
      ))}
    </Stack>
  );
}
