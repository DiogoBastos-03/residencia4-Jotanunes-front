import { useCallback } from 'react';
import { nomeDoTipoDocumento, type Dataset, type MotivoReprovacao } from '@/entities';
import { datasetStore } from '@/mocks';
import { strings } from '@/shared/strings';

function registrar(ds: Dataset, documentoId: string, resultado: 'aprovado' | 'reprovado', extra: { motivo?: MotivoReprovacao; observacao?: string } = {}) {
  const doc = ds.documentos.find((d) => d.id === documentoId);
  if (!doc) return ds.analises;
  return [
    {
      id: `an-${documentoId}-${ds.analises.length}`,
      quando: ds.agora,
      analista: strings.dominio.usuarioAtual,
      documento: nomeDoTipoDocumento(ds, doc.tipoDocumentoId),
      fornecedorId: doc.fornecedorId,
      resultado,
      documentoId,
      ...extra,
    },
    ...ds.analises,
  ];
}

/** Decisões sobre documentos da empresa. Alteram os dados em memória; todas as telas recalculam. */
export function useDecisoes() {
  const aprovarDocumento = useCallback((documentoId: string, validade: string | undefined) => {
    datasetStore.set((ds) => ({
      ...ds,
      analises: registrar(ds, documentoId, 'aprovado'),
      documentos: ds.documentos.map((d) => {
        if (d.id !== documentoId) return d;
        const envio = d.renovacao;
        const anteriores = d.arquivo && d.enviadoEm && envio
          ? [{ arquivo: d.arquivo, enviadoEm: d.enviadoEm.slice(0, 10), resultado: 'aprovado' as const }, ...d.enviosAnteriores.filter((e) => e.arquivo !== d.arquivo)]
          : d.enviosAnteriores;
        return {
          ...d,
          status: 'aprovado',
          validade,
          arquivo: envio?.arquivo ?? d.arquivo,
          tamanhoKb: envio?.tamanhoKb ?? d.tamanhoKb,
          enviadoEm: envio?.enviadoEm ?? d.enviadoEm,
          paginas: envio?.paginas ?? d.paginas,
          renovacao: undefined,
          pendenteDesde: undefined,
          enviosAnteriores: anteriores,
        };
      }),
    }));
  }, []);

  const reprovarDocumento = useCallback((documentoId: string, motivo: MotivoReprovacao, observacao: string) => {
    datasetStore.set((ds) => ({
      ...ds,
      analises: registrar(ds, documentoId, 'reprovado', { motivo, observacao }),
      documentos: ds.documentos.map((d) => {
        if (d.id !== documentoId) return d;
        // Nova versão recusada: a atual continua valendo.
        if (d.renovacao) {
          return {
            ...d,
            renovacao: undefined,
            enviosAnteriores: [{ arquivo: d.renovacao.arquivo, enviadoEm: d.renovacao.enviadoEm.slice(0, 10), resultado: 'reprovado' as const }, ...d.enviosAnteriores],
          };
        }
        return { ...d, status: 'reprovado', pendenteDesde: ds.hoje };
      }),
    }));
  }, []);

  const concluirRemessa = useCallback((remessaId: string) => {
    datasetStore.set((ds) => ({
      ...ds,
      remessas: ds.remessas.map((r) => (r.id === remessaId ? { ...r, situacao: 'concluida' } : r)),
    }));
  }, []);

  return { aprovarDocumento, reprovarDocumento, concluirRemessa };
}
