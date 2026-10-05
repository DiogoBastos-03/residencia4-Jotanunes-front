import { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import type { MotivoReprovacao } from '@/entities';
import { strings } from '@/shared/strings';
import { Button, Field, Modal, Select, Stack, Textarea } from '@/shared/ui';
import { useExemploReprovacao } from '../hooks/useExemploReprovacao';

const t = strings.pages.envio.modalReprovar;
const CHAVES: readonly MotivoReprovacao[] = ['ilegivel', 'foraValidade', 'incorreto', 'faltaAssinatura'];
const MOTIVOS = CHAVES.map((value) => ({ value, label: strings.dominio.motivos[value] }));

type Props = {
  /** Nome do arquivo a reprovar; null fecha. */
  nome: string | null;
  onClose: () => void;
  onConfirm: (motivo: MotivoReprovacao, observacao: string) => void;
};

/** Reprovar um arquivo: motivo + observação. Confirmação destrutiva. */
export function ModalReprovarArquivo({ nome, onClose, onConfirm }: Props) {
  const exemplo = useExemploReprovacao();
  const [motivo, setMotivo] = useState<MotivoReprovacao>(exemplo.motivo);
  const [observacao, setObservacao] = useState<string>(exemplo.observacao);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!nome) return;
    setMotivo(exemplo.motivo);
    setObservacao(exemplo.observacao);
    setErro(null);
  }, [nome, exemplo.motivo, exemplo.observacao]);

  return (
    <Modal
      open={nome !== null}
      onClose={onClose}
      title={t.title}
      description={nome ? t.description(nome) : undefined}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button
            variant="danger"
            icon={XCircleIcon}
            onClick={() => {
              if (!observacao.trim()) return setErro(t.observacaoErro);
              onConfirm(motivo, observacao.trim());
            }}
          >
            {t.confirmar}
          </Button>
        </>
      }
    >
      <Stack>
        <Field label={t.motivo}>
          {(control) => (
            <Select
              {...control}
              options={MOTIVOS}
              value={motivo}
              onChange={(e) => {
                const escolhido = CHAVES.find((c) => c === e.target.value);
                if (escolhido) setMotivo(escolhido);
              }}
            />
          )}
        </Field>
        <Field label={t.observacao} error={erro}>
          {(control) => (
            <Textarea
              {...control}
              rows={3}
              value={observacao}
              onChange={(e) => {
                setObservacao(e.target.value);
                setErro(null);
              }}
            />
          )}
        </Field>
      </Stack>
    </Modal>
  );
}
