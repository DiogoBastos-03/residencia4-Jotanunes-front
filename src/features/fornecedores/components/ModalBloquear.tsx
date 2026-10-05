import { useEffect, useState } from 'react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import type { Fornecedor } from '@/entities';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Modal, Stack, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../hooks/useAcoesFornecedor';
import { errosDaApi } from '../lib';

const t = strings.modais.bloquear;

/** Confirmação destrutiva: o botão "Bloquear" é o vermelho de perigo. */
export function ModalBloquear({ fornecedor, open, onClose }: { fornecedor: Fornecedor; open: boolean; onClose: () => void }) {
  const { bloquear } = useAcoesFornecedor();
  const { showToast } = useToast();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>();

  useEffect(() => {
    if (open) setErro(undefined);
  }, [open]);

  async function confirmar() {
    setEnviando(true);
    setErro(undefined);
    try {
      await bloquear(fornecedor.id);
    } catch (e) {
      setErro(errosDaApi(e).topo ?? strings.api.semResposta);
      setEnviando(false);
      return;
    }
    setEnviando(false);
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
          <Button variant="danger" icon={NoSymbolIcon} disabled={enviando} aria-busy={enviando} onClick={() => void confirmar()}>
            {enviando ? t.confirmando : t.confirmar}
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
