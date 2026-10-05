import { useState } from 'react';
import type { Obra } from '@/entities';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Card, CheckboxBox, Heading, Mono, SearchInput, Text } from '@/shared/ui';
import type { NovaLista } from '../../types';

const t = strings.pages.novaLista.obras;

export type ObraComTipos = { obra: Obra; servico: number; material: number };

function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

type Props = { dados: NovaLista; obras: readonly ObraComTipos[]; onChange: (obraIds: string[]) => void };

export function BlocoObrasLista({ dados, obras, onChange }: Props) {
  const [busca, setBusca] = useState('');
  const termo = semAcento(busca.trim());
  const visiveis = obras.filter((o) => semAcento(o.obra.nome).includes(termo) || semAcento(o.obra.codigo).includes(termo));
  const escolhidas = obras.filter((o) => dados.obraIds.includes(o.obra.id));
  const alcance = escolhidas.reduce((n, o) => n + o[dados.tipo], 0);
  return (
    <Card as="section">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Heading>{t.title}</Heading>
          <Text size="support" tone="muted" className="mt-1">
            {t.description}
          </Text>
        </div>
        <SearchInput label={t.buscaLabel} placeholder={t.buscaPlaceholder} value={busca} onChange={(e) => setBusca(e.target.value)} wrapperClassName="lg:w-65 lg:flex-none" />
      </div>
      {visiveis.length === 0 ? (
        <Text size="support" tone="muted" className="mt-3">
          {t.semResultado}
        </Text>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-control border border-border">
          {visiveis.map(({ obra }) => {
            const marcada = dados.obraIds.includes(obra.id);
            return (
              <li key={obra.id} className="border-b border-border last:border-b-0">
                <label className={cn('interactive-row flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.75', marcada && 'bg-action-soft')}>
                  <CheckboxBox
                    checked={marcada}
                    onChange={() => onChange(marcada ? dados.obraIds.filter((id) => id !== obra.id) : [...dados.obraIds, obra.id])}
                  />
                  <Text as="span" weight="medium" className="min-w-0 flex-1">
                    {obra.nome}
                  </Text>
                  <Mono className="w-20">{obra.codigo}</Mono>
                  <Text as="span" size="support" tone="muted" className="w-55 max-md:w-auto">
                    {strings.dominio.cidadeUf(obra.cidade, obra.uf)}
                  </Text>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <Text size="support" weight="medium" tone="soft" className="mt-2.5">
        {escolhidas.length === 0 ? t.nenhuma : t.resumo(escolhidas.length, alcance, strings.dominio.tipo[dados.tipo])}
      </Text>
    </Card>
  );
}
