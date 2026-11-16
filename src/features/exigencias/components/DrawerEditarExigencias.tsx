import { useEffect, useState } from 'react';
import { useEditarExigencias, type ItemExigencia, type ListaDetalhe } from '@/entities/exigencias';
import type { DefinicaoDocumento } from '@/entities/tipoDocumento';
import { numeroVersao } from '@/shared/strings/pages/exigencias';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Drawer, Stack, useToast } from '@/shared/ui';
import { errosDaApiLista, mesmasExigencias } from '../lib';
import { EditorExigencias } from './EditorExigencias';

const t = strings.drawers.editarExigencias;

/**
 * PUT /workflow/workflows/{id}/requirements. Não edita a versão vigente: cria a próxima
 * (WorkflowVersionNumber.Next = atual + 1) e move as obras para ela. O aviso diz isso antes de salvar;
 * o toast diz o número que a API devolveu. Exigências iguais às vigentes não criam versão.
 */
export function DrawerEditarExigencias({
  lista,
  definicoes,
  open,
  onClose,
}: {
  lista: ListaDetalhe;
  definicoes: readonly DefinicaoDocumento[];
  open: boolean;
  onClose: () => void;
}) {
  const editar = useEditarExigencias();
  const { showToast } = useToast();
  const vigentes: ItemExigencia[] = lista.vigente.exigencias.map((e) => ({ definicaoId: e.definicaoId, obrigatoria: e.obrigatoria }));
  const [itens, setItens] = useState<ItemExigencia[]>(vigentes);
  const [erro, setErro] = useState<string | undefined>();
  const [topo, setTopo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setItens(vigentes);
    setErro(undefined);
    setTopo(null);
    // Só ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const atual = numeroVersao(lista.vigente.numero);
  const proxima = numeroVersao(lista.vigente.numero + 1);
  const mudou = !mesmasExigencias(itens, vigentes);

  async function salvar() {
    setTopo(null);
    if (itens.length === 0) {
      setErro(strings.errosApi.porCampo.documentos);
      return;
    }
    try {
      const r = await editar.mutateAsync({ id: lista.id, exigencias: itens });
      showToast(r.versao === lista.vigente.numero ? t.semMudanca(numeroVersao(r.versao)) : t.toast(numeroVersao(r.versao)));
      onClose();
    } catch (e) {
      const m = errosDaApiLista(e);
      setErro(m.campos.documentos);
      setTopo(m.topo);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t.title}
      subtitle={t.subtitle(lista.nome)}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="primary" disabled={editar.isPending || !mudou} aria-busy={editar.isPending} onClick={() => void salvar()}>
            {editar.isPending ? t.salvando : t.salvar(proxima)}
          </Button>
        </>
      }
    >
      <Stack>
        <AlertBox variant="warning" withIcon>
          {t.aviso(atual, proxima)}
        </AlertBox>
        {topo && (
          <AlertBox variant="error" title={t.erroTitle} withIcon>
            {topo}
          </AlertBox>
        )}
        <EditorExigencias
          itens={itens}
          onChange={(novos) => {
            setItens(novos);
            setErro(undefined);
          }}
          definicoes={definicoes}
          erro={erro}
        />
      </Stack>
    </Drawer>
  );
}
