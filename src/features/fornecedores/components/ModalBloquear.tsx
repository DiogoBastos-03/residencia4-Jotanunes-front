import { NoSymbolIcon } from '@heroicons/react/24/outline';
import type { Fornecedor } from '@/entities';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Modal, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../hooks/useAcoesFornecedor';

const t = strings.modais.bloquear;

/** Confirmação destrutiva: o botão "Bloquear" é o vermelho de perigo. */
export function ModalBloquear({ fornecedor, open, onClose }: { fornecedor: Fornecedor; open: boolean; onClose: () => void }) {
  const { bloquear } = useAcoesFornecedor();
  const { showToast } = useToast();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={t.texto(fornecedor.razaoSocial)}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button
            variant="danger"
            icon={NoSymbolIcon}
            onClick={() => {
              bloquear(fornecedor.id);
              showToast(t.toast);
              onClose();
            }}
          >
            {t.confirmar}
          </Button>
        </>
      }
    >
      <AlertBox variant="error">{t.alerta}</AlertBox>
    </Modal>
  );
}
