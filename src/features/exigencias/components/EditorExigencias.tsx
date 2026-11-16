import { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ItemExigencia } from '@/entities/exigencias';
import type { DefinicaoDocumento } from '@/entities/tipoDocumento';
import { strings } from '@/shared/strings';
import { Button, CheckboxBox, IconButton, InfoNote, Mono, Select, Stack, Text } from '@/shared/ui';

const t = strings.editorExigencias;

type Props = {
  itens: readonly ItemExigencia[];
  onChange: (itens: ItemExigencia[]) => void;
  /** Tipos de documento da API — os que podem ser exigidos. */
  definicoes: readonly DefinicaoDocumento[];
  erro?: string;
};

/**
 * Documentos de uma versão da lista: escolher o tipo, marcar se é obrigatório e ordenar.
 * A posição na tela vira o displayOrder do back (1, 2, 3…). O mesmo tipo não entra duas vezes
 * (o back recusa com DUPLICATED_REQUIREMENT), então o seletor só oferece os que faltam.
 */
export function EditorExigencias({ itens, onChange, definicoes, erro }: Props) {
  const [escolha, setEscolha] = useState('');
  const nomeDe = (id: string) => definicoes.find((d) => d.id === id)?.nome ?? id;
  const disponiveis = definicoes.filter((d) => !itens.some((i) => i.definicaoId === d.id));

  const mover = (de: number, para: number) => {
    const novo = [...itens];
    const [item] = novo.splice(de, 1);
    if (item) novo.splice(para, 0, item);
    onChange(novo);
  };

  return (
    <Stack>
      {itens.length === 0 ? (
        <Text size="support" tone="muted">
          {t.vazio}
        </Text>
      ) : (
        <ol aria-label={t.caption} className="divide-y divide-border rounded-control border border-border">
          {itens.map((item, i) => {
            const nome = nomeDe(item.definicaoId);
            return (
              <li key={item.definicaoId} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <Mono className="w-6 text-ink-3">{i + 1}</Mono>
                <Text weight="medium" className="min-w-0 flex-1 break-words">
                  {nome}
                </Text>
                <label className="flex items-center gap-2 text-support">
                  <CheckboxBox
                    checked={item.obrigatoria}
                    aria-label={t.obrigatorio(nome)}
                    onChange={(e) => onChange(itens.map((x, j) => (j === i ? { ...x, obrigatoria: e.target.checked } : x)))}
                  />
                  {t.colunas.obrigatorio}
                </label>
                <span className="flex gap-1">
                  <IconButton icon={ArrowUpIcon} label={t.subir(nome)} size="sm" variant="ghost" disabled={i === 0} onClick={() => mover(i, i - 1)} />
                  <IconButton icon={ArrowDownIcon} label={t.descer(nome)} size="sm" variant="ghost" disabled={i === itens.length - 1} onClick={() => mover(i, i + 1)} />
                  <IconButton icon={TrashIcon} label={t.remover(nome)} size="sm" variant="ghost" onClick={() => onChange(itens.filter((_, j) => j !== i))} />
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {erro && (
        <p role="alert" className="text-support text-danger">
          {erro}
        </p>
      )}
      {definicoes.length === 0 ? (
        <InfoNote>{t.semTipos}</InfoNote>
      ) : disponiveis.length === 0 ? (
        <Text size="support" tone="muted">
          {t.todosIncluidos}
        </Text>
      ) : (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Select
            aria-label={t.adicionar}
            wrapperClassName="min-w-0 flex-1 basis-60"
            value={escolha}
            onChange={(e) => setEscolha(e.target.value)}
            options={[{ value: '', label: t.escolha }, ...disponiveis.map((d) => ({ value: d.id, label: d.nome }))]}
          />
          <Button
            icon={PlusIcon}
            disabled={!escolha}
            onClick={() => {
              onChange([...itens, { definicaoId: escolha, obrigatoria: true }]);
              setEscolha('');
            }}
          >
            {t.adicionarBotao}
          </Button>
        </div>
      )}
    </Stack>
  );
}
