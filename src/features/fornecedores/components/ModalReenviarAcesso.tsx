import { useEffect, useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import type { Fornecedor } from '@/entities';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button, Field, InfoNote, Input, Modal, Stack, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../hooks/useAcoesFornecedor';

const t = strings.modais.reenviarAcesso;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = { fornecedor: Fornecedor | null; onClose: () => void };

/** Reenvia o convite de primeiro acesso ao portal. O e-mail pode ser corrigido antes. */
export function ModalReenviarAcesso({ fornecedor, onClose }: Props) {
  const { reenviarAcesso } = useAcoesFornecedor();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (fornecedor) {
      setEmail(fornecedor.acessoPortal.emailConvite);
      setErro(null);
    }
  }, [fornecedor]);

  const convidadoEm = fornecedor?.acessoPortal.convidadoEm;

  return (
    <Modal
      open={fornecedor !== null}
      onClose={onClose}
      title={t.title}
      description={fornecedor ? t.texto(fornecedor.razaoSocial, email || fornecedor.acessoPortal.emailConvite) : undefined}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button
            variant="primary"
            icon={EnvelopeIcon}
            onClick={() => {
              if (!fornecedor) return;
              if (!EMAIL.test(email.trim())) {
                setErro(t.emailErro);
                return;
              }
              reenviarAcesso(fornecedor.id, email.trim());
              showToast(t.toast(email.trim()));
              onClose();
            }}
          >
            {t.confirmar}
          </Button>
        </>
      }
    >
      <Stack>
        <Field label={t.email} error={erro}>
          {(control) => (
            <Input
              {...control}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErro(null);
              }}
            />
          )}
        </Field>
        <InfoNote>{convidadoEm ? t.ultimoEnvio(formatDate(convidadoEm, 'date')) : t.nuncaEnviado}</InfoNote>
      </Stack>
    </Modal>
  );
}
