import { strings } from '@/shared/strings';
import { Button, InfoNote, Modal, useToast } from '@/shared/ui';
import { useVinculosObra } from '../hooks/useVinculosObra';
import type { FichaObra } from '../types';

const t = strings.pages.obra.modalDesvincular;

type Props = {
  ficha: FichaObra;
  /** Lista a desvincular; null fecha o modal. */
  listaId: string | null;
  onClose: () => void;
};

/** Confirmação destrutiva. A última lista da obra nunca chega aqui. */
export function ModalDesvincularLista({ ficha, listaId, onClose }: Props) {
  const { desvincularLista } = useVinculosObra();
  const { showToast } = useToast();
  const item = ficha.listas.find((l) => l.lista.id === listaId);
  const podeDesvincular = item !== undefined && ficha.listas.length > 1;
  return (
    <Modal
      open={podeDesvincular}
      onClose={onClose}
      title={t.title}
      description={item ? t.texto(item.lista.nome, ficha.obra.nome, item.aplicaA, strings.dominio.tipo[item.lista.tipo]) : undefined}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!item) return;
              desvincularLista(ficha.obra.id, item.lista.id);
              showToast(t.toast);
              onClose();
            }}
          >
            {t.confirmar}
          </Button>
        </>
      }
    >
      <InfoNote>{t.nota}</InfoNote>
    </Modal>
  );
}
