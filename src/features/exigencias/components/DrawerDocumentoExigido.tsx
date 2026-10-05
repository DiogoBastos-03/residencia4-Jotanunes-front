import { useEffect, useState } from 'react';
import type { EscopoItem, ExigenciaValidade, Obrigatoriedade } from '@/entities';
import { strings } from '@/shared/strings';
import { Button, Drawer, Field, InfoNote, Input, Select, Stack, Textarea } from '@/shared/ui';
import type { ItemRascunho } from '../types';

const t = strings.drawers.documento;
const AVISOS = [30, 15, 7] as const;

type Props = {
  open: boolean;
  listaNome: string;
  /** Escopo do item novo (o de um item em edição vem dele). */
  escopo: EscopoItem;
  /** Item em edição; null para um novo. */
  emEdicao: ItemRascunho | null;
  /** Exemplo que preenche um documento novo. */
  exemplo: (escopo: EscopoItem) => ItemRascunho;
  vazio: boolean;
  /** Nomes que a lista já exige (para não duplicar). */
  nomesExistentes: readonly string[];
  impacto: string;
  onClose: () => void;
  onSalvar: (item: ItemRascunho) => void;
};

/** Novo documento (ou edição) — da empresa ou de funcionário. A única diferença é aceitar vários arquivos. */
export function DrawerDocumentoExigido({ open, listaNome, escopo: escopoNovo, emEdicao, exemplo, vazio, nomesExistentes, impacto, onClose, onSalvar }: Props) {
  const [item, setItem] = useState<ItemRascunho | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const base = emEdicao ?? exemplo(escopoNovo);
    setItem(vazio && !emEdicao ? { ...base, nome: '', instrucoes: '' } : base);
    setErro(null);
    // Só ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, emEdicao?.id, vazio, escopoNovo]);

  const escopo = item?.escopo ?? escopoNovo;

  const mudar = (parcial: Partial<ItemRascunho>) => setItem((atual) => (atual ? { ...atual, ...parcial } : atual));

  function salvar() {
    if (!item) return;
    const nome = item.nome.trim();
    if (!nome) return setErro(t.nomeErro);
    const outros = nomesExistentes.filter((n) => n !== emEdicao?.nome).map((n) => n.toLowerCase());
    if (outros.includes(nome.toLowerCase())) return setErro(t.nomeDuplicado);
    onSalvar({ ...item, nome, avisoDias: item.validade === 'comData' ? item.avisoDias : undefined });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={emEdicao ? t.tituloEditar[escopo] : t.tituloNovo[escopo]}
      subtitle={t.subtitle(strings.dominio.escopo[escopo], listaNome)}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            {t.cancelar}
          </Button>
          <Button variant="primary" onClick={salvar}>
            {emEdicao ? t.salvar : t.adicionar}
          </Button>
        </>
      }
    >
      {item && (
        <Stack>
          <InfoNote>{t.escopoNota[escopo]}</InfoNote>
          <Field label={t.nome} error={erro}>
            {(control) => (
              <Input
                {...control}
                placeholder={t.nomePlaceholder[escopo]}
                value={item.nome}
                onChange={(e) => {
                  mudar({ nome: e.target.value });
                  setErro(null);
                }}
              />
            )}
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t.tipo}>
              {(control) => (
                <Select
                  {...control}
                  value={item.obrigatoriedade}
                  onChange={(e) => mudar({ obrigatoriedade: e.target.value === 'opcional' ? 'opcional' : 'obrigatorio' satisfies Obrigatoriedade })}
                  options={[
                    { value: 'obrigatorio', label: t.obrigatoriedades.obrigatorio },
                    { value: 'opcional', label: t.obrigatoriedades.opcional },
                  ]}
                />
              )}
            </Field>
            <Field label={t.validade[escopo]}>
              {(control) => (
                <Select
                  {...control}
                  value={item.validade}
                  onChange={(e) => {
                    const validade: ExigenciaValidade = e.target.value === 'semValidade' ? 'semValidade' : 'comData';
                    mudar({ validade, avisoDias: validade === 'comData' ? (item.avisoDias ?? 30) : undefined });
                  }}
                  options={[
                    { value: 'comData', label: t.validades.comData },
                    { value: 'semValidade', label: t.validades.semValidade },
                  ]}
                />
              )}
            </Field>
            <Field label={t.aviso}>
              {(control) => (
                <Select
                  {...control}
                  disabled={item.validade !== 'comData'}
                  value={String(item.avisoDias ?? 30)}
                  onChange={(e) => mudar({ avisoDias: Number(e.target.value) })}
                  options={AVISOS.map((d) => ({ value: String(d), label: t.avisos(d) }))}
                />
              )}
            </Field>
            <Field label={t.formatos}>
              {(control) => (
                <Select
                  {...control}
                  value={item.formatos}
                  onChange={(e) => mudar({ formatos: e.target.value === 'pdf' ? 'pdf' : 'pdfImagem' })}
                  options={[
                    { value: 'pdfImagem', label: t.formatosOpcoes.pdfImagem },
                    { value: 'pdf', label: t.formatosOpcoes.pdf },
                  ]}
                />
              )}
            </Field>
          </div>
          <Field label={t.instrucoes}>
            {(control) => (
              <Textarea
                {...control}
                rows={3}
                placeholder={t.instrucoesPlaceholder}
                value={item.instrucoes ?? ''}
                onChange={(e) => mudar({ instrucoes: e.target.value })}
              />
            )}
          </Field>
          <InfoNote title={t.impactoTitle}>{impacto}</InfoNote>
          {!emEdicao && (
            <div>
              <Button variant="link" size="sm" onClick={() => mudar({ nome: '', instrucoes: '' })}>
                {t.limpar}
              </Button>
            </div>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
