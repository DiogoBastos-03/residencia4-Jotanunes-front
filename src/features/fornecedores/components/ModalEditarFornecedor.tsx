import { useEffect, useState } from 'react';
import type { Fornecedor } from '@/entities';
import { formatCnpj, formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Field, Input, Modal, Stack, Text, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../hooks/useAcoesFornecedor';
import { errosDaApi, validarDados } from '../lib';
import type { EdicaoFornecedor, ErrosFormFornecedor } from '../types';
import { SeletorTipos } from './novo/SeletorTipos';

const t = strings.modais.editarFornecedor;
const tf = strings.pages.fornecedorNovo;

function dadosDe(f: Fornecedor): EdicaoFornecedor {
  return { razaoSocial: f.razaoSocial, telefone: f.telefone, email: f.email, tipos: [...f.tipos] };
}

/**
 * Edita o que a API deixa mudar: razão social, telefone e e-mail (PATCH) e os tipos (PUT).
 * 400 marca o campo; 409, 422 e 500 aparecem no topo do modal.
 */
export function ModalEditarFornecedor({ fornecedor, open, onClose }: { fornecedor: Fornecedor; open: boolean; onClose: () => void }) {
  const { editar } = useAcoesFornecedor();
  const { showToast } = useToast();
  const [dados, setDados] = useState<EdicaoFornecedor>(() => dadosDe(fornecedor));
  const [erros, setErros] = useState<ErrosFormFornecedor>({});
  const [erroTopo, setErroTopo] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDados(dadosDe(fornecedor));
    setErros({});
    setErroTopo(undefined);
    // Só ao abrir: depois de salvar, o fornecedor recarregado não deve apagar o que está na tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mudar = (parcial: Partial<EdicaoFornecedor>) => {
    setDados((atual) => ({ ...atual, ...parcial }));
    setErros((atual) => Object.fromEntries(Object.entries(atual).filter(([campo]) => !(campo in parcial))));
  };

  async function salvar() {
    const novos = validarDados(dados);
    setErros(novos);
    setErroTopo(undefined);
    if (Object.values(novos).some(Boolean)) return;
    setEnviando(true);
    let mudou: boolean;
    try {
      mudou = await editar(fornecedor, dados);
    } catch (erro) {
      const { campos, topo } = errosDaApi(erro);
      // O CNPJ não é editável aqui: um 409 vai para o topo.
      const { cnpj, ...outros } = campos;
      setErros(outros);
      setErroTopo(topo ?? cnpj);
      setEnviando(false);
      return;
    }
    setEnviando(false);
    showToast(mudou ? t.toast : t.semMudanca);
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
          <Button variant="primary" disabled={enviando} aria-busy={enviando} onClick={() => void salvar()}>
            {enviando ? t.salvando : t.salvar}
          </Button>
        </>
      }
    >
      <Stack>
        {erroTopo && (
          <AlertBox variant="error" title={t.erroTitle} withIcon>
            {erroTopo}
          </AlertBox>
        )}
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
