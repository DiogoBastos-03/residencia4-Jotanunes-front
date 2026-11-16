import { useEffect, useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useVincularFornecedor } from '@/entities/obra';
import { ApiError, mensagemDoErro } from '@/shared/api';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Field, InfoNote, Input, Modal, Select, Stack, useToast } from '@/shared/ui';

const t = strings.modais.vincular;

/**
 * De qual lado o vínculo é feito: na ficha da obra escolhe-se o fornecedor; na ficha do
 * fornecedor, a obra. A rota é a mesma (POST …/constructions/{obraId}/enterprises).
 */
export type LadoVinculo =
  | { de: 'obra'; obraId: string; nomeObra: string }
  | { de: 'fornecedor'; fornecedorId: string; razaoSocial: string };

type Props = {
  lado: LadoVinculo;
  /** O que dá para escolher do outro lado (já filtrado pelo que o back aceita). */
  opcoes: ReadonlyArray<{ id: string; nome: string }>;
  open: boolean;
  onClose: () => void;
};

type Erros = { escolha?: string; prazo?: string };

/** Erro da API → campo do modal (prazo) ou mensagem geral (o resto), sempre pela tabela por code. */
function errosDaApi(e: unknown): { campos: Erros; topo: string | null } {
  if (e instanceof ApiError && e.code === 'INVALID_LIMIT_EXPIRES_DAYS') return { campos: { prazo: e.mensagem }, topo: null };
  if (e instanceof ApiError && e.code === 'VALIDATION_ERROR') {
    const campos: Erros = {};
    if (e.errosDoCampo('limitExpiresDays').length) campos.prazo = strings.errosApi.porCampo.prazo;
    if (e.errosDoCampo('enterpriseId').length) campos.escolha = strings.errosApi.porCampo.fornecedor;
    return { campos, topo: Object.keys(campos).length ? null : e.mensagem };
  }
  return { campos: {}, topo: mensagemDoErro(e) };
}

export function ModalVincular({ lado, opcoes, open, onClose }: Props) {
  const vincular = useVincularFornecedor();
  const { showToast } = useToast();
  const [escolha, setEscolha] = useState('');
  const [prazo, setPrazo] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [topo, setTopo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEscolha('');
    setPrazo('');
    setErros({});
    setTopo(null);
  }, [open]);

  const deObra = lado.de === 'obra';

  async function confirmar() {
    const dias = Number(prazo);
    const novos: Erros = {
      escolha: escolha ? undefined : deObra ? strings.errosApi.porCampo.fornecedor : strings.errosApi.porCampo.obra,
      prazo: Number.isInteger(dias) && dias >= 1 && dias <= 9999 ? undefined : strings.errosApi.porCampo.prazo,
    };
    setErros(novos);
    setTopo(null);
    if (novos.escolha || novos.prazo) return;
    try {
      const r = await vincular.mutateAsync({
        obraId: lado.de === 'obra' ? lado.obraId : escolha,
        fornecedorId: lado.de === 'fornecedor' ? lado.fornecedorId : escolha,
        prazoDias: dias,
      });
      showToast(t.toast(r.workflowsAtribuidos, r.tiposSemWorkflow.length ? strings.dominio.tipos(r.tiposSemWorkflow) : null));
      onClose();
    } catch (e) {
      const m = errosDaApi(e);
      setErros(m.campos);
      setTopo(m.topo);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={deObra ? t.titleFornecedor : t.titleObra}
      description={lado.de === 'obra' ? t.descricaoFornecedor(lado.nomeObra) : t.descricaoObra(lado.razaoSocial)}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button
            variant="primary"
            icon={LinkIcon}
            disabled={vincular.isPending || opcoes.length === 0}
            aria-busy={vincular.isPending}
            onClick={() => void confirmar()}
          >
            {vincular.isPending ? t.confirmando : t.confirmar}
          </Button>
        </>
      }
    >
      <Stack>
        {topo && (
          <AlertBox variant="error" title={t.erroTitle} withIcon>
            {topo}
          </AlertBox>
        )}
        {opcoes.length === 0 ? (
          <InfoNote>{deObra ? t.semFornecedores : t.semObras}</InfoNote>
        ) : (
          <>
            <Field label={deObra ? t.fornecedor : t.obra} error={erros.escolha}>
              {(control) => (
                <Select
                  {...control}
                  value={escolha}
                  onChange={(e) => setEscolha(e.target.value)}
                  options={[{ value: '', label: t.escolha }, ...opcoes.map((o) => ({ value: o.id, label: o.nome }))]}
                />
              )}
            </Field>
            <Field label={t.prazo} hint={t.prazoHint} error={erros.prazo}>
              {(control) => (
                <Input {...control} inputMode="numeric" value={prazo} onChange={(e) => setPrazo(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              )}
            </Field>
          </>
        )}
      </Stack>
    </Modal>
  );
}
