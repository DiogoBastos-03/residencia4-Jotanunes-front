import { useEffect, useState } from 'react';
import { LinkSlashIcon } from '@heroicons/react/24/outline';
import { useDesvincularFornecedor } from '@/entities/obra';
import { mensagemDoErro } from '@/shared/api';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Modal, Stack, useToast } from '@/shared/ui';

const t = strings.modais.desvincular;

export type AlvoDesvinculo = { obraId: string; nomeObra: string; fornecedorId: string; razaoSocial: string };

/** Confirmação destrutiva do DELETE …/constructions/{obraId}/enterprises/{fornecedorId}. */
export function ModalDesvincular({ alvo, onClose }: { alvo: AlvoDesvinculo | null; onClose: () => void }) {
  const desvincular = useDesvincularFornecedor();
  const { showToast } = useToast();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (alvo) setErro(null);
  }, [alvo]);

  async function confirmar() {
    if (!alvo) return;
    setErro(null);
    try {
      await desvincular.mutateAsync({ obraId: alvo.obraId, fornecedorId: alvo.fornecedorId });
    } catch (e) {
      setErro(mensagemDoErro(e));
      return;
    }
    showToast(t.toast);
    onClose();
  }

  return (
    <Modal
      open={alvo !== null}
      onClose={onClose}
      title={t.title}
      description={alvo ? t.texto(alvo.razaoSocial, alvo.nomeObra) : undefined}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="danger" icon={LinkSlashIcon} disabled={desvincular.isPending} aria-busy={desvincular.isPending} onClick={() => void confirmar()}>
            {desvincular.isPending ? t.confirmando : t.confirmar}
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
