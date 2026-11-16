import { useEffect, useState } from 'react';
import { useRenomearLista, type ListaDetalhe } from '@/entities/exigencias';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Field, Input, Modal, Stack, useToast } from '@/shared/ui';
import { errosDaApiLista, type ErrosLista } from '../lib';

const t = strings.modais.renomearLista;

/** PATCH /workflow/workflows/{id} { name }. Renomear não cria versão. */
export function ModalRenomearLista({ lista, open, onClose }: { lista: ListaDetalhe; open: boolean; onClose: () => void }) {
  const renomear = useRenomearLista();
  const { showToast } = useToast();
  const [nome, setNome] = useState(lista.nome);
  const [erros, setErros] = useState<ErrosLista>({});
  const [topo, setTopo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNome(lista.nome);
    setErros({});
    setTopo(null);
    // Só ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function salvar() {
    setTopo(null);
    if (!nome.trim() || nome.trim().length > 150) {
      setErros({ nome: strings.errosApi.porCodigo.INVALID_WORKFLOW_NAME });
      return;
    }
    if (nome.trim() === lista.nome) {
      showToast(t.semMudanca);
      onClose();
      return;
    }
    try {
      await renomear.mutateAsync({ id: lista.id, nome });
    } catch (e) {
      const r = errosDaApiLista(e);
      setErros(r.campos);
      setTopo(r.topo);
      return;
    }
    showToast(t.toast);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={t.descricao}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="primary" disabled={renomear.isPending} aria-busy={renomear.isPending} onClick={() => void salvar()}>
            {renomear.isPending ? t.salvando : t.salvar}
          </Button>
        </>
      }
    >
      <Stack>
        {topo && (
          <AlertBox variant="error" title={t.erroTitle} withIcon>
            {topo}
          </AlertBox>
        )}
        <Field label={t.nome} error={erros.nome}>
          {(control) => <Input {...control} maxLength={150} value={nome} onChange={(e) => setNome(e.target.value)} />}
        </Field>
      </Stack>
    </Modal>
  );
}
