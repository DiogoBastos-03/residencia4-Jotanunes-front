import { useEffect, useState } from 'react';
import type { Fornecedor } from '@/entities';
import { formatCnpj, formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Field, Input, Modal, Stack, Text, useToast } from '@/shared/ui';
import { useEditarFornecedor } from '../hooks/useMutacoesFornecedor';
import { errosDaApi, limparErrosDaApi, SEM_ERROS_DA_API, validarDados, type ErrosDaApi } from '../lib';
import type { EdicaoFornecedor, ErrosFormFornecedor } from '../types';
import { SeletorTipos } from './novo/SeletorTipos';

const t = strings.modais.editarFornecedor;
const tf = strings.pages.fornecedorNovo;

function dadosDe(f: Fornecedor): EdicaoFornecedor {
  return { razaoSocial: f.razaoSocial, telefone: f.telefone, email: f.email, tipos: [...f.tipos] };
}

/** Edita razão social, telefone, e-mail e tipos. O CNPJ não muda. Chama PATCH /enterprises/{id} e PUT /types. */
export function ModalEditarFornecedor({ fornecedor, open, onClose }: { fornecedor: Fornecedor; open: boolean; onClose: () => void }) {
  const edicao = useEditarFornecedor();
  const { showToast } = useToast();
  const [dados, setDados] = useState<EdicaoFornecedor>(() => dadosDe(fornecedor));
  const [erros, setErros] = useState<ErrosFormFornecedor>({});
  const [daApi, setDaApi] = useState<ErrosDaApi>(SEM_ERROS_DA_API);

  useEffect(() => {
    if (!open) return;
    setDados(dadosDe(fornecedor));
    setErros({});
    setDaApi(SEM_ERROS_DA_API);
    // Só ao abrir: depois de salvar, o fornecedor atualizado não deve apagar o que está na tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mudar = (parcial: Partial<EdicaoFornecedor>) => {
    setDados((atual) => ({ ...atual, ...parcial }));
    setErros((atual) => Object.fromEntries(Object.entries(atual).filter(([campo]) => !(campo in parcial))));
    setDaApi((atual) => limparErrosDaApi(atual, Object.keys(parcial)));
  };

  async function salvar() {
    const novos = validarDados(dados);
    setErros(novos);
    setDaApi(SEM_ERROS_DA_API);
    if (Object.values(novos).some(Boolean)) return;
    let mudou: boolean;
    try {
      mudou = await edicao.mutateAsync({ atual: fornecedor, dados });
    } catch (e) {
      setDaApi(errosDaApi(e));
      return;
    }
    showToast(mudou ? t.toast : t.semMudanca);
    onClose();
  }

  const visiveis: ErrosFormFornecedor = { ...erros, ...daApi.campos };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={t.descricao}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="primary" disabled={edicao.isPending} aria-busy={edicao.isPending} onClick={() => void salvar()}>
            {edicao.isPending ? t.salvando : t.salvar}
          </Button>
        </>
      }
    >
      <Stack>
        {daApi.topo && (
          <AlertBox variant="error" title={t.erroTitle} withIcon>
            {daApi.topo}
          </AlertBox>
        )}
        <Field label={tf.identificacao.cnpj}>
          {(control) => <Input {...control} mono disabled value={formatCnpj(fornecedor.cnpj)} />}
        </Field>
        <Field label={tf.identificacao.razao} error={visiveis.razaoSocial}>
          {(control) => <Input {...control} value={dados.razaoSocial} onChange={(e) => mudar({ razaoSocial: e.target.value })} />}
        </Field>
        <Field label={tf.identificacao.telefone} error={visiveis.telefone}>
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
        <Field label={tf.identificacao.email} error={visiveis.email}>
          {(control) => <Input {...control} type="email" value={dados.email} onChange={(e) => mudar({ email: e.target.value })} />}
        </Field>
        <div>
          <Text size="label" weight="medium" tone="soft" className="mb-2">
            {t.tipos}
          </Text>
          <SeletorTipos semCartao tipos={dados.tipos} onChange={(tipos) => mudar({ tipos })} erro={visiveis.tipos} />
        </div>
      </Stack>
    </Modal>
  );
}
