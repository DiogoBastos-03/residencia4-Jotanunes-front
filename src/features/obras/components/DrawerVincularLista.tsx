import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, CheckboxBox, Drawer, InfoNote, SearchInput, Stack, Text, useToast } from '@/shared/ui';
import { useExemplosObra } from '../hooks/useExemplosObra';
import { useVinculosObra } from '../hooks/useVinculosObra';
import type { FichaObra, ListaComComposicao } from '../types';

const t = strings.pages.obra.drawerLista;

type Props = {
  ficha: FichaObra;
  open: boolean;
  vazio: boolean;
  onClose: () => void;
  onVinculado: () => void;
};

function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function DrawerVincularLista({ ficha, open, vazio, onClose, onVinculado }: Props) {
  const exemplo = useExemplosObra().listasParaVincular;
  const { vincularListas } = useVinculosObra();
  const { showToast } = useToast();
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelecionadas(vazio ? [] : exemplo.filter((id) => ficha.listasDisponiveis.some((l) => l.lista.id === id)));
    setBusca('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vazio]);

  const jaNaObra: ListaComComposicao[] = ficha.listas;
  const todas = [...jaNaObra.map((l) => ({ ...l, ja: true })), ...ficha.listasDisponiveis.map((l) => ({ ...l, ja: false }))];
  const visiveis = todas.filter((l) => semAcento(l.lista.nome).includes(semAcento(busca.trim())));

  const escolhidas = ficha.listasDisponiveis.filter((l) => selecionadas.includes(l.lista.id));
  const tipos = [...new Set(escolhidas.map((l) => l.lista.tipo))];
  const fornecedores = tipos.reduce((n, tipo) => n + ficha.fornecedoresPorTipo[tipo], 0);
  const novos = new Set(
    escolhidas.flatMap((l) =>
      l.lista.itens.flatMap((i) =>
        !ficha.documentosExigidosPorTipo[l.lista.tipo].includes(i.tipoDocumentoId) ? [`${l.lista.tipo}:${i.tipoDocumentoId}`] : [],
      ),
    ),
  ).size;

  function alternar(id: string) {
    setSelecionadas((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t.title}
      subtitle={t.subtitle(ficha.obra.nome, ficha.obra.codigo)}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            {t.cancelar}
          </Button>
          <Button
            variant="primary"
            disabled={escolhidas.length === 0}
            onClick={() => {
              vincularListas(ficha.obra.id, escolhidas.map((l) => l.lista.id));
              showToast(t.toast(escolhidas.length));
              onVinculado();
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
              {t.ativas}
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
              {visiveis.map(({ lista, composicao, ja }) => {
                const marcada = ja || selecionadas.includes(lista.id);
                return (
                  <li key={lista.id} className="border-b border-border last:border-b-0">
                    <label
                      className={cn(
                        'flex items-start gap-2.5 px-4 py-3',
                        ja ? 'cursor-default' : 'interactive-row',
                        !ja && marcada && 'bg-action-soft',
                      )}
                    >
                      <CheckboxBox
                        className="mt-0.5"
                        locked={ja}
                        checked={marcada}
                        onChange={() => alternar(lista.id)}
                        aria-describedby={`composicao-${lista.id}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <Text as="span" weight="medium">
                            {lista.nome}
                          </Text>
                          <Badge status={lista.tipo} />
                        </span>
                        <Text as="span" size="support" tone="muted" className="mt-0.75 block" >
                          <span id={`composicao-${lista.id}`}>
                            {strings.dominio.composicao(composicao.documentosObrigatorios, composicao.documentosOpcionais, composicao.documentosFuncionario)}
                          </span>
                        </Text>
                      </span>
                      {ja && (
                        <Text as="span" size="label" weight="medium" tone="faint" className="flex-none">
                          {t.jaNestaObra}
                        </Text>
                      )}
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
          <Text className="mt-1 leading-[1.35]">
            {escolhidas.length === 0
              ? t.nenhuma
              : t.resumoTexto(escolhidas.length, fornecedores, tipos.map((tipo) => strings.dominio.tipo[tipo]).join(' e '), novos)}
          </Text>
        </div>
        <InfoNote>{t.nota}</InfoNote>
      </Stack>
    </Drawer>
  );
}
