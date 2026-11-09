import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, CheckboxBox, Drawer, Mono, SearchInput, Stack, Text, useToast } from '@/shared/ui';
import { useAcoesLista } from '../hooks/useAcoesLista';
import type { DetalheLista } from '../types';

const t = strings.drawers.vincularObras;

function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

type Props = {
  detalhe: DetalheLista;
  open: boolean;
  vazio: boolean;
  exemplo: readonly string[];
  onClose: () => void;
};

export function DrawerVincularObrasLista({ detalhe, open, vazio, exemplo, onClose }: Props) {
  const { vincularObras } = useAcoesLista();
  const { showToast } = useToast();
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const disponiveis = detalhe.obrasParaVincular.filter((o) => !o.jaVinculada);

  useEffect(() => {
    if (!open) return;
    setSelecionadas(vazio ? [] : exemplo.filter((id) => disponiveis.some((o) => o.obra.id === id)));
    setBusca('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vazio]);

  const termo = semAcento(busca.trim());
  const visiveis = detalhe.obrasParaVincular.filter(
    (o) => semAcento(o.obra.nome).includes(termo) || semAcento(o.obra.codigo).includes(termo),
  );
  const escolhidas = disponiveis.filter((o) => selecionadas.includes(o.obra.id));
  const fornecedores = escolhidas.reduce((n, o) => n + o.fornecedoresDoTipo, 0);
  const tipo = strings.dominio.tipo[detalhe.lista.tipo];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t.title}
      subtitle={t.subtitle(detalhe.lista.nome, strings.status[detalhe.lista.tipo])}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            {t.cancelar}
          </Button>
          <Button
            variant="primary"
            disabled={escolhidas.length === 0}
            onClick={() => {
              vincularObras(detalhe.lista.id, escolhidas.map((o) => o.obra.id));
              showToast(strings.pages.lista.obrasToast(escolhidas.length));
              onClose();
            }}
          >
            {t.confirmar(escolhidas.length)}
          </Button>
        </>
      }
    >
      <Stack>
        <SearchInput label={t.buscaLabel} placeholder={t.buscaPlaceholder} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Text size="label" weight="medium" tone="soft">
              {t.obras}
            </Text>
            {selecionadas.length > 0 && (
              <Button variant="link" size="sm" onClick={() => setSelecionadas([])}>
                {t.limpar}
              </Button>
            )}
          </div>
          {visiveis.length === 0 ? (
            <Text size="support" tone="muted">
              {t.semResultado}
            </Text>
          ) : (
            <ul className="overflow-hidden rounded-control border border-border">
              {visiveis.map(({ obra, jaVinculada }) => {
                const marcada = jaVinculada || selecionadas.includes(obra.id);
                return (
                  <li key={obra.id} className="border-b border-border last:border-b-0">
                    <label className={cn('flex items-center gap-2.5 px-4 py-3', jaVinculada ? 'cursor-default' : 'interactive-row', !jaVinculada && marcada && 'bg-action-soft')}>
                      <CheckboxBox
                        locked={jaVinculada}
                        checked={marcada}
                        onChange={() =>
                          setSelecionadas((atual) => (atual.includes(obra.id) ? atual.filter((x) => x !== obra.id) : [...atual, obra.id]))
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <Text as="span" weight="medium" className="block">
                          {obra.nome}
                        </Text>
                        <Text as="span" size="support" tone="muted" className="mt-0.5 block">
                          <Mono>{obra.codigo}</Mono> {strings.common.separator} {strings.dominio.cidadeUf(obra.cidade, obra.uf)}
                        </Text>
                      </span>
                      {jaVinculada && (
                        <Text as="span" size="label" weight="medium" tone="faint" className="flex-none max-sm:hidden">
                          {t.jaVinculada}
                        </Text>
                      )}
                      <Badge status={obra.situacao} />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="rounded-control border border-border px-4 py-3">
          <Text size="label" weight="medium" tone="soft">
            {t.resumo}
          </Text>
          <Text className="mt-1 leading-[1.35]">{escolhidas.length === 0 ? t.nenhuma : t.resumoTexto(escolhidas.length, fornecedores, tipo)}</Text>
        </div>
      </Stack>
    </Drawer>
  );
}
