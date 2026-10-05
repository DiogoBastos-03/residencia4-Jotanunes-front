import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { Button, InfoNote, Modal } from '@/shared/ui';

const t = strings.pages.analise.modalAprovar;

type ModalAprovarProps = {
  open: boolean;
  documento: string;
  /** dd/mm/aaaa, ou null quando o documento não tem validade. */
  validade: string | null;
  avisoDias: number;
  renovacao: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ModalAprovar({ open, documento, validade, avisoDias, renovacao, onClose, onConfirm }: ModalAprovarProps) {
  const nome = strings.dominio.nomeCurto(documento);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={validade ? t.comValidade(nome, validade, avisoDias) : t.semValidade(nome)}
      footer={
        <>
          <Button onClick={onClose}>{t.voltar}</Button>
          <Button variant="primary" icon={CheckCircleIcon} onClick={onConfirm}>
            {t.confirmar}
          </Button>
        </>
      }
    >
      {renovacao && <InfoNote>{t.renovacao}</InfoNote>}
    </Modal>
  );
}
