import { useEffect, useState } from 'react';
import type { Fornecedor } from '@/entities';
import { formatCnpj, formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button, Field, Input, Modal, Stack, Text, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../hooks/useAcoesFornecedor';
import { validarDados } from '../lib';
import type { EdicaoFornecedor, ErrosFormFornecedor } from '../types';
import { SeletorTipos } from './novo/SeletorTipos';

const t = strings.modais.editarFornecedor;
const tf = strings.pages.fornecedorNovo;

function dadosDe(f: Fornecedor): EdicaoFornecedor {
  return { razaoSocial: f.razaoSocial, telefone: f.telefone, email: f.email, tipos: [...f.tipos] };
}

/** Edita razão social, telefone, e-mail e tipos. O CNPJ não muda. */
export function ModalEditarFornecedor({ fornecedor, open, onClose }: { fornecedor: Fornecedor; open: boolean; onClose: () => void }) {
  const { editar } = useAcoesFornecedor();
  const { showToast } = useToast();
  const [dados, setDados] = useState<EdicaoFornecedor>(() => dadosDe(fornecedor));
  const [erros, setErros] = useState<ErrosFormFornecedor>({});

  useEffect(() => {
    if (!open) return;
    setDados(dadosDe(fornecedor));
    setErros({});
    // Só ao abrir: depois de salvar, o fornecedor atualizado não deve apagar o que está na tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mudar = (parcial: Partial<EdicaoFornecedor>) => {
    setDados((atual) => ({ ...atual, ...parcial }));
    setErros((atual) => Object.fromEntries(Object.entries(atual).filter(([campo]) => !(campo in parcial))));
  };

  function salvar() {
    const novos = validarDados(dados);
    setErros(novos);
    if (Object.values(novos).some(Boolean)) return;
    showToast(editar(fornecedor, dados) ? t.toast : t.semMudanca);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={t.descricao}
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
        <Field label={tf.identificacao.cnpj}>
          {(control) => <Input {...control} mono disabled value={formatCnpj(fornecedor.cnpj)} />}
        </Field>
        <Field label={tf.identificacao.razao} error={erros.razaoSocial}>
          {(control) => <Input {...control} value={dados.razaoSocial} onChange={(e) => mudar({ razaoSocial: e.target.value })} />}
        </Field>
        <Field label={tf.identificacao.telefone} error={erros.telefone}>
          {(control) => (
            <Input
              {...control}
              inputMode="tel"
              placeholder={tf.identificacao.telefonePlaceholder}
              value={formatPhone(dados.telefone)}
              onChange={(e) => mudar({ telefone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            />
          )}
        </Field>
        <Field label={tf.identificacao.email} error={erros.email}>
          {(control) => <Input {...control} type="email" value={dados.email} onChange={(e) => mudar({ email: e.target.value })} />}
        </Field>
        <div>
          <Text size="label" weight="medium" tone="soft" className="mb-2">
            {t.tipos}
          </Text>
          <SeletorTipos semCartao tipos={dados.tipos} onChange={(tipos) => mudar({ tipos })} erro={erros.tipos} />
        </div>
      </Stack>
    </Modal>
  );
}
