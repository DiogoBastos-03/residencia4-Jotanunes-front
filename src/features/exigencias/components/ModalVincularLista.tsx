import { useEffect, useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useVincularListaAObra, type ListaResumo } from '@/entities/exigencias';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Field, InfoNote, Input, Modal, Select, Stack, useToast } from '@/shared/ui';
import { errosDaApiLista, prazoValido, type ErrosLista } from '../lib';

const t = strings.modais.vincularLista;

/**
 * POST /workflow/constructions/{obraId}/workflows { workFlowId, limitExpiresDays }.
 * `opcoes` já vem filtrada: listas que a obra ainda não usa e de um tipo que ela ainda não tem.
 */
export function ModalVincularLista({
  obraId,
  nomeObra,
  opcoes,
  open,
  onClose,
}: {
  obraId: string;
  nomeObra: string;
  opcoes: readonly ListaResumo[];
  open: boolean;
  onClose: () => void;
}) {
  const vincular = useVincularListaAObra();
  const { showToast } = useToast();
  const [listaId, setListaId] = useState('');
  const [prazo, setPrazo] = useState('');
  const [erros, setErros] = useState<ErrosLista>({});
  const [topo, setTopo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setListaId('');
    setPrazo('');
    setErros({});
    setTopo(null);
  }, [open]);

  async function confirmar() {
    const dias = prazoValido(prazo);
    const novos: ErrosLista = { obra: listaId ? undefined : strings.errosApi.porCampo.lista, prazo: dias === null ? strings.errosApi.porCampo.prazo : undefined };
    setErros(novos);
    setTopo(null);
    if (novos.obra || novos.prazo || dias === null) return;
    const lista = opcoes.find((l) => String(l.id) === listaId);
    try {
      const r = await vincular.mutateAsync({ obraId, listaId: Number(listaId), prazoDias: dias });
      showToast(t.toast(lista?.nome ?? '', r.empresasVinculadas));
      onClose();
    } catch (e) {
      const m = errosDaApiLista(e);
      // Aqui "obra" é o campo da lista escolhida.
      setErros({ obra: m.campos.obra, prazo: m.campos.prazo });
      setTopo(m.topo);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.title}
      description={t.descricao(nomeObra)}
      footer={
        <>
          <Button onClick={onClose}>{t.cancelar}</Button>
          <Button variant="primary" icon={LinkIcon} disabled={vincular.isPending} aria-busy={vincular.isPending} onClick={() => void confirmar()}>
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
        <InfoNote>{t.regra}</InfoNote>
        <Field label={t.lista} error={erros.obra}>
          {(control) => (
            <Select
              {...control}
              value={listaId}
              onChange={(e) => setListaId(e.target.value)}
              options={[{ value: '', label: t.escolha }, ...opcoes.map((l) => ({ value: String(l.id), label: t.opcao(l.nome, strings.status[l.tipo]) }))]}
            />
          )}
        </Field>
        <Field label={t.prazo} hint={t.prazoHint} error={erros.prazo}>
          {(control) => <Input {...control} inputMode="numeric" value={prazo} onChange={(e) => setPrazo(e.target.value.replace(/\D/g, '').slice(0, 4))} />}
        </Field>
      </Stack>
    </Modal>
  );
}
