import { strings } from '@/shared/strings';
import { Button, InfoNote, Modal, useToast } from '@/shared/ui';
import { useAcoesLista } from '../hooks/useAcoesLista';
import type { DetalheLista } from '../types';

const t = strings.pages.lista.modalRemover;

/** Tira a lista de uma obra. A última lista da obra nunca chega aqui. */
export function ModalRemoverDaObra({ detalhe, obraId, onClose }: { detalhe: DetalheLista; obraId: string | null; onClose: () => void }) {
  const { removerDaObra } = useAcoesLista();
  const { showToast } = useToast();
  const alvo = detalhe.obrasVinculadas.find((o) => o.obra.id === obraId);
  return (
    <Modal
      open={alvo !== undefined && !alvo.unica}
      onClose={onClose}
      title={t.title}
      description={alvo ? t.texto(detalhe.lista.nome, alvo.obra.nome, alvo.fornecedoresDoTipo, strings.dominio.tipo[detalhe.lista.tipo]) : undefined}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!alvo) return;
              removerDaObra(detalhe.lista.id, alvo.obra.id);
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
