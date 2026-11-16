import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { TipoFornecimento } from '@/entities';
import { useCriarLista, useListasDasObras, type ItemExigencia } from '@/entities/exigencias';
import { useObrasApi } from '@/entities/obra';
import { useDefinicoesApi } from '@/entities/tipoDocumento';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, ButtonLink, Card, ChoiceCard, Field, Heading, Input, PageHeader, Select, Stack, Text, useToast } from '@/shared/ui';
import { errosDaApiLista, prazoValido, type ErrosLista } from '../lib';
import { EditorExigencias } from './EditorExigencias';

const t = strings.pages.novaLista;
const TIPOS: readonly TipoFornecimento[] = ['servico', 'material'];

/**
 * POST /workflow/workflows. Obra e prazo são opcionais: com obra, a lista já nasce vinculada
 * (e o prazo passa a ser obrigatório); sem obra, o prazo nem é enviado — o back o ignoraria.
 * Só oferece as obras que ainda não têm uma lista do tipo escolhido (o back recusaria com 409).
 */
export function NovaListaForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const criar = useCriarLista();
  const definicoes = useDefinicoesApi();
  const obras = useObrasApi();
  const obraIds = obras.data?.itens.map((o) => o.id) ?? [];
  const listasDasObras = useListasDasObras(obraIds);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoFornecimento | null>(null);
  const [itens, setItens] = useState<ItemExigencia[]>([]);
  const [obraId, setObraId] = useState('');
  const [prazo, setPrazo] = useState('');
  const [erros, setErros] = useState<ErrosLista>({});
  const [topo, setTopo] = useState<string | null>(null);

  const obrasLivres = (obras.data?.itens ?? []).filter((_obra, i) => {
    const listas = listasDasObras[i]?.data;
    return tipo !== null && listas !== undefined && !listas.some((l) => l.tipo === tipo);
  });

  const limpar = (campo: keyof ErrosLista) => setErros((e) => ({ ...e, [campo]: undefined }));

  async function salvar() {
    const dias = prazoValido(prazo);
    const novos: ErrosLista = {
      nome: nome.trim() ? undefined : strings.errosApi.porCampo.nome,
      tipo: tipo ? undefined : strings.errosApi.porCampo.tipo,
      documentos: itens.length > 0 ? undefined : strings.errosApi.porCampo.documentos,
      prazo: obraId && dias === null ? strings.errosApi.porCampo.prazo : undefined,
    };
    setErros(novos);
    setTopo(null);
    if (Object.values(novos).some(Boolean) || !tipo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const obra = obraId && dias !== null ? { id: obraId, prazoDias: dias } : undefined;
    try {
      const r = await criar.mutateAsync({ nome, tipo, exigencias: itens, obra });
      const nomeObra = obras.data?.itens.find((o) => o.id === obraId)?.nome ?? '';
      showToast(obra ? t.toastObra(nome.trim(), nomeObra, r.empresasVinculadas) : t.toast(nome.trim()));
      navigate(paths.lista(r.id));
    } catch (e) {
      const m = errosDaApiLista(e);
      setErros(m.campos);
      setTopo(m.topo ?? (Object.keys(m.campos).length ? null : strings.errosApi.porCodigo.VALIDATION_ERROR));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const temErro = Object.values(erros).some(Boolean);

  return (
    <Stack>
      <PageHeader
        level="subpage"
        back={{ to: paths.exigencias, label: t.voltar }}
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <ButtonLink to={paths.exigencias}>{t.cancelar}</ButtonLink>
            <Button variant="primary" disabled={criar.isPending} aria-busy={criar.isPending} onClick={() => void salvar()}>
              {criar.isPending ? t.salvando : t.salvar}
            </Button>
          </>
        }
      />
      {topo && (
        <AlertBox variant="error" title={t.alertaTitle} withIcon>
          {topo}
        </AlertBox>
      )}
      {!topo && temErro && (
        <AlertBox variant="error" title={t.alertaErrosTitle} withIcon>
          {t.alertaErros}
        </AlertBox>
      )}
      <Card as="section">
        <Heading>{t.identificacao}</Heading>
        <div className="mt-3 grid gap-3">
          <Field label={t.nome} error={erros.nome}>
            {(control) => (
              <Input
                {...control}
                maxLength={150}
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  limpar('nome');
                }}
              />
            )}
          </Field>
          <div>
            <Text size="label" weight="medium" tone="soft" className="mb-2">
              {t.tipo}
            </Text>
            <div role="radiogroup" aria-label={t.tipo} className="grid gap-3 lg:grid-cols-2">
              {TIPOS.map((x) => (
                <ChoiceCard
                  key={x}
                  name="tipo-lista"
                  value={x}
                  checked={tipo === x}
                  onChange={() => {
                    setTipo(x);
                    setObraId('');
                    limpar('tipo');
                  }}
                  title={t.tipos[x].title}
                  description={t.tipos[x].description}
                />
              ))}
            </div>
            {erros.tipo && <p role="alert" className="mt-1.5 text-support text-danger">{erros.tipo}</p>}
          </div>
        </div>
      </Card>
      <Card as="section">
        <Heading>{t.documentos}</Heading>
        <Text size="support" tone="muted" className="mt-1 mb-3">
          {strings.editorExigencias.descricao}
        </Text>
        <EditorExigencias
          itens={itens}
          onChange={(novos) => {
            setItens(novos);
            limpar('documentos');
          }}
          definicoes={definicoes.data?.itens ?? []}
          erro={erros.documentos}
        />
      </Card>
      <Card as="section">
        <Heading>{t.obra}</Heading>
        <Text size="support" tone="muted" className="mt-1">
          {t.obraDescricao}
        </Text>
        {tipo && obrasLivres.length === 0 && listasDasObras.every((q) => q.data !== undefined) ? (
          <Text size="support" tone="muted" className="mt-3">
            {t.obraSemVaga(t.tipos[tipo].title.toLowerCase())}
          </Text>
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Field label={t.obraCampo} error={erros.obra}>
              {(control) => (
                <Select
                  {...control}
                  disabled={!tipo}
                  value={obraId}
                  onChange={(e) => {
                    setObraId(e.target.value);
                    if (!e.target.value) setPrazo('');
                    limpar('obra');
                  }}
                  options={[{ value: '', label: t.nenhuma }, ...obrasLivres.map((o) => ({ value: o.id, label: o.nome }))]}
                />
              )}
            </Field>
            {obraId && (
              <Field label={t.prazo} hint={t.prazoHint} error={erros.prazo}>
                {(control) => (
                  <Input
                    {...control}
                    inputMode="numeric"
                    value={prazo}
                    onChange={(e) => {
                      setPrazo(e.target.value.replace(/\D/g, '').slice(0, 4));
                      limpar('prazo');
                    }}
                  />
                )}
              </Field>
            )}
          </div>
        )}
      </Card>
    </Stack>
  );
}
