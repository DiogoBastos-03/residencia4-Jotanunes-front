import { useEffect, useState } from 'react';
import {
  TAMANHO_MAX_BYTES,
  useCriarDefinicao,
  useDefinicaoDetalhe,
  useEditarDefinicao,
  useFormatosApi,
  type DadosDefinicao,
  type DefinicaoDocumento,
} from '@/entities/tipoDocumento';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Checkbox, ChoiceCard, Drawer, Field, Input, Stack, Text, Textarea, useToast } from '@/shared/ui';
import { MB, errosDaApiTipo, mbParaBytes, type ErrosTipo } from '../lib';

const t = strings.drawers.tipoDocumento;

type Form = { nome: string; descricao: string; tamanhoMb: string; reaproveitavel: boolean; vence: boolean; dias: string; formatoIds: number[] };

const VAZIO: Form = { nome: '', descricao: '', tamanhoMb: '', reaproveitavel: false, vence: true, dias: '', formatoIds: [] };

function formDe(d: DefinicaoDocumento): Form {
  return {
    nome: d.nome,
    descricao: d.descricao,
    tamanhoMb: (d.tamanhoMaxBytes / MB).toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
    reaproveitavel: d.reaproveitavel,
    vence: d.validadeDias !== null,
    dias: d.validadeDias === null ? '' : String(d.validadeDias),
    formatoIds: [...d.formatoIds],
  };
}

/** Validação local com as mesmas regras do back (DocumentDefinition, ExpirationPolicy). */
function validar(f: Form): { erros: ErrosTipo; dados: DadosDefinicao | null } {
  const bytes = mbParaBytes(f.tamanhoMb);
  const dias = Number(f.dias);
  const erros: ErrosTipo = {
    nome: f.nome.trim() && f.nome.trim().length <= 100 ? undefined : strings.errosApi.porCampo.nome,
    descricao: f.descricao.trim().length <= 255 ? undefined : strings.errosApi.porCampo.descricao,
    tamanho: bytes !== null && bytes > 0 && bytes <= TAMANHO_MAX_BYTES ? undefined : strings.errosApi.porCampo.tamanho,
    validade: !f.vence || (Number.isInteger(dias) && dias >= 1 && dias <= 9999) ? undefined : strings.errosApi.porCampo.validade,
    formatos: f.formatoIds.length > 0 ? undefined : strings.errosApi.porCampo.formatos,
  };
  if (Object.values(erros).some(Boolean) || bytes === null) return { erros, dados: null };
  return {
    erros,
    dados: {
      nome: f.nome,
      descricao: f.descricao,
      tamanhoMaxBytes: bytes,
      reaproveitavel: f.reaproveitavel,
      validadeDias: f.vence ? dias : null,
      formatoIds: f.formatoIds,
    },
  };
}

/** Criar (POST) ou editar (PATCH só com o que mudou) um tipo de documento. Não há excluir no back. */
export function DrawerTipoDocumento({ tipo, open, onClose }: { tipo: DefinicaoDocumento | null; open: boolean; onClose: () => void }) {
  const criar = useCriarDefinicao();
  const editar = useEditarDefinicao();
  const formatos = useFormatosApi();
  const detalhe = useDefinicaoDetalhe(open && tipo ? tipo.id : null);
  const { showToast } = useToast();
  const [form, setForm] = useState<Form>(VAZIO);
  const [erros, setErros] = useState<ErrosTipo>({});
  const [topo, setTopo] = useState<string | null>(null);
  const enviando = criar.isPending || editar.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(tipo ? formDe(tipo) : VAZIO);
    setErros({});
    setTopo(null);
    // Só ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mudar = (parcial: Partial<Form>, campo: keyof ErrosTipo) => {
    setForm((f) => ({ ...f, ...parcial }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  async function salvar() {
    const { erros: novos, dados } = validar(form);
    setErros(novos);
    setTopo(null);
    if (!dados) return;
    try {
      if (tipo) {
        const mudou = await editar.mutateAsync({ atual: tipo, dados });
        showToast(mudou ? t.toastEditado(dados.nome.trim()) : t.semMudanca);
      } else {
        await criar.mutateAsync(dados);
        showToast(t.toastNovo(dados.nome.trim()));
      }
      onClose();
    } catch (e) {
      const m = errosDaApiTipo(e);
      setErros(m.campos);
      setTopo(m.topo);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={tipo ? t.titleEditar : t.titleNovo}
      subtitle={
        detalhe.data ? `${t.criadoEm(formatDate(detalhe.data.criadoEm, 'date'))} • ${t.atualizadoEm(formatDate(detalhe.data.atualizadoEm, 'dateTime'))}` : undefined
      }
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="primary" disabled={enviando} aria-busy={enviando} onClick={() => void salvar()}>
            {enviando ? t.salvando : tipo ? t.salvar : t.criar}
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
        <Field label={t.nome} error={erros.nome}>
          {(control) => <Input {...control} maxLength={100} value={form.nome} onChange={(e) => mudar({ nome: e.target.value }, 'nome')} />}
        </Field>
        <Field label={t.descricao} error={erros.descricao}>
          {(control) => <Textarea {...control} rows={2} maxLength={255} value={form.descricao} onChange={(e) => mudar({ descricao: e.target.value }, 'descricao')} />}
        </Field>
        <div>
          <Text size="label" weight="medium" tone="soft" className="mb-2">
            {t.validade}
          </Text>
          <div role="radiogroup" aria-label={t.validade} className="grid gap-2 sm:grid-cols-2">
            <ChoiceCard name="validade" value="vence" checked={form.vence} onChange={() => mudar({ vence: true }, 'validade')} title={t.vence} description={t.venceDescricao} />
            <ChoiceCard name="validade" value="naoVence" checked={!form.vence} onChange={() => mudar({ vence: false, dias: '' }, 'validade')} title={t.naoVence} description={t.naoVenceDescricao} />
          </div>
        </div>
        {form.vence && (
          <Field label={t.dias} error={erros.validade}>
            {(control) => <Input {...control} inputMode="numeric" value={form.dias} onChange={(e) => mudar({ dias: e.target.value.replace(/\D/g, '').slice(0, 4) }, 'validade')} />}
          </Field>
        )}
        {!form.vence && erros.validade && <p role="alert" className="text-support text-danger">{erros.validade}</p>}
        <Field label={t.tamanho} hint={t.tamanhoHint} error={erros.tamanho}>
          {(control) => <Input {...control} inputMode="decimal" value={form.tamanhoMb} onChange={(e) => mudar({ tamanhoMb: e.target.value.replace(/[^\d,.]/g, '').slice(0, 6) }, 'tamanho')} />}
        </Field>
        <fieldset>
          <legend className="mb-2 text-label font-medium text-ink-2">{t.formatos}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {(formatos.data ?? []).map((f) => (
              <Checkbox
                key={f.id}
                label={f.nome}
                checked={form.formatoIds.includes(f.id)}
                onChange={(e) =>
                  mudar({ formatoIds: e.target.checked ? [...form.formatoIds, f.id] : form.formatoIds.filter((x) => x !== f.id) }, 'formatos')
                }
              />
            ))}
          </div>
          {erros.formatos && <p role="alert" className="mt-1.5 text-support text-danger">{erros.formatos}</p>}
        </fieldset>
        <Checkbox
          label={t.reaproveitavel}
          description={t.reaproveitavelDescricao}
          checked={form.reaproveitavel}
          onChange={(e) => setForm((f) => ({ ...f, reaproveitavel: e.target.checked }))}
        />
      </Stack>
    </Drawer>
  );
}
