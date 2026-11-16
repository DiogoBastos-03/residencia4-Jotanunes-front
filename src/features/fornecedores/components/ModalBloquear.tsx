import { useEffect, useState } from 'react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import type { FornecedorResumo } from '@/entities';
import { mensagemDoErro } from '@/shared/api';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Modal, Stack, useToast } from '@/shared/ui';
import { useDefinirBloqueio } from '../hooks/useMutacoesFornecedor';

const t = strings.modais.bloquear;

/** Confirmação destrutiva: o botão "Bloquear" é o vermelho de perigo. Chama PATCH /enterprises/{id}/status. */
export function ModalBloquear({ fornecedor, open, onClose }: { fornecedor: Pick<FornecedorResumo, 'id' | 'razaoSocial'>; open: boolean; onClose: () => void }) {
  const bloqueio = useDefinirBloqueio();
  const { showToast } = useToast();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) setErro(null);
  }, [open]);

  async function confirmar() {
    setErro(null);
    try {
      await bloqueio.mutateAsync({ id: fornecedor.id, bloqueado: true });
    } catch (e) {
      setErro(mensagemDoErro(e));
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
      description={t.texto(fornecedor.razaoSocial)}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="danger" icon={NoSymbolIcon} disabled={bloqueio.isPending} aria-busy={bloqueio.isPending} onClick={() => void confirmar()}>
            {bloqueio.isPending ? t.confirmando : t.confirmar}
          </Button>
        </>
      }
    >
      <Stack>
        {erro && (
          <AlertBox variant="error" title={t.erroTitle} withIcon>
            {erro}
          </AlertBox>
        )}
        <AlertBox variant="error">{t.alerta}</AlertBox>
      </Stack>
    </Modal>
  );
}
