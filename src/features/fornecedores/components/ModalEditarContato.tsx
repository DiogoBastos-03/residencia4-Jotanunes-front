import { useEffect, useState } from 'react';
import type { Contato, Fornecedor } from '@/entities';
import { formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button, Field, Input, Modal, Stack, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../hooks/useAcoesFornecedor';
import { emailValido } from '../lib';

const t = strings.modais.editarContato;
const tc = strings.pages.fornecedor.contatos;

type Erros = Partial<Record<'nome' | 'email', string>>;

function contatoDe(fornecedor: Fornecedor, papel: Contato['papel']): Contato {
  return fornecedor.contatos.find((c) => c.papel === papel) ?? { papel, nome: '', cargo: '', email: '', telefone: '' };
}

type Props = { fornecedor: Fornecedor; papel: Contato['papel'] | null; onClose: () => void };

/** Edita (ou cria) o contato principal ou o de segurança do trabalho. */
export function ModalEditarContato({ fornecedor, papel, onClose }: Props) {
  const { salvarContato } = useAcoesFornecedor();
  const { showToast } = useToast();
  const [contato, setContato] = useState<Contato>(() => contatoDe(fornecedor, papel ?? 'principal'));
  const [erros, setErros] = useState<Erros>({});

  useEffect(() => {
    if (!papel) return;
    setContato(contatoDe(fornecedor, papel));
    setErros({});
    // Só ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [papel]);

  const mudar = (parcial: Partial<Contato>) => setContato((atual) => ({ ...atual, ...parcial }));

  function salvar() {
    const novos: Erros = {
      nome: contato.nome.trim() ? undefined : t.nomeErro,
      email: emailValido(contato.email) ? undefined : t.emailErro,
    };
    setErros(novos);
    if (Object.values(novos).some(Boolean)) return;
    salvarContato(fornecedor.id, { ...contato, nome: contato.nome.trim(), cargo: contato.cargo.trim(), email: contato.email.trim() });
    showToast(t.toast);
    onClose();
  }

  return (
    <Modal
      open={papel !== null}
      onClose={onClose}
      title={papel === 'seguranca' ? t.titleSeguranca : t.titlePrincipal}
      description={t.descricao(fornecedor.razaoSocial)}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="primary" onClick={salvar}>
            {t.salvar}
          </Button>
        </>
      }
    >
      <Stack>
        <Field label={tc.nome} error={erros.nome}>
          {(control) => <Input {...control} value={contato.nome} onChange={(e) => mudar({ nome: e.target.value })} />}
        </Field>
        <Field label={t.cargo}>{(control) => <Input {...control} value={contato.cargo} onChange={(e) => mudar({ cargo: e.target.value })} />}</Field>
        <Field label={tc.email} error={erros.email}>
          {(control) => <Input {...control} type="email" value={contato.email} onChange={(e) => mudar({ email: e.target.value })} />}
        </Field>
        <Field label={t.telefone}>
          {(control) => (
            <Input
              {...control}
              inputMode="tel"
              value={formatPhone(contato.telefone)}
              onChange={(e) => mudar({ telefone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            />
          )}
        </Field>
      </Stack>
    </Modal>
  );
}
