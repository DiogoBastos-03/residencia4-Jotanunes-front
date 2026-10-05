import { XCircleIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Modal } from '@/shared/ui';

const t = strings.pages.analise.modalReprovar;

type ModalReprovarProps = {
  open: boolean;
  renovacao: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Confirmação destrutiva: o botão de confirmar é o vermelho de perigo. */
export function ModalReprovar({ open, renovacao, onClose, onConfirm }: ModalReprovarProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={t.description}
      footer={
        <>
          <Button onClick={onClose}>{t.voltar}</Button>
          <Button variant="danger" icon={XCircleIcon} onClick={onConfirm}>
            {t.confirmar}
          </Button>
        </>
      }
    >
      <AlertBox variant="error">{renovacao ? t.alertaRenovacao : t.alerta}</AlertBox>
    </Modal>
  );
}
