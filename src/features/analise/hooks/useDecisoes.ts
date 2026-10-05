import { useCallback } from 'react';
import { nomeDoTipoDocumento, type Dataset, type MotivoReprovacao } from '@/entities';
import { datasetStore } from '@/mocks';
import { strings } from '@/shared/strings';

const VOCE = strings.dominio.usuarioAtual;

type Registro = { documento: string; fornecedorId: string; documentoId?: string; arquivoId?: string };

function registrar(ds: Dataset, r: Registro, resultado: 'aprovado' | 'reprovado', extra: { motivo?: MotivoReprovacao; observacao?: string } = {}) {
  return [{ id: `an-${r.documentoId ?? r.arquivoId}-${ds.analises.length}`, quando: ds.agora, analista: VOCE, resultado, ...r, ...extra }, ...ds.analises];
}

/** Decisões sobre documentos da empresa e arquivos de funcionário. Alteram os dados em memória. */
export function useDecisoes() {
  const aprovarDocumento = useCallback((documentoId: string, validade: string | undefined) => {
    datasetStore.set((ds) => {
      const doc = ds.documentos.find((d) => d.id === documentoId);
      if (!doc) return ds;
      return {
        ...ds,
        analises: registrar(ds, { documento: nomeDoTipoDocumento(ds, doc.tipoDocumentoId), fornecedorId: doc.fornecedorId, documentoId }, 'aprovado'),
        documentos: ds.documentos.map((d) => {
          if (d.id !== documentoId) return d;
          const envio = d.renovacao;
          const anteriores =
            d.arquivo && d.enviadoEm && envio
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
            decisao: { por: VOCE, em: ds.agora },
            enviosAnteriores: anteriores,
          };
        }),
      };
    });
  }, []);

  const reprovarDocumento = useCallback((documentoId: string, motivo: MotivoReprovacao, observacao: string) => {
    datasetStore.set((ds) => {
      const doc = ds.documentos.find((d) => d.id === documentoId);
      if (!doc) return ds;
      return {
        ...ds,
        analises: registrar(ds, { documento: nomeDoTipoDocumento(ds, doc.tipoDocumentoId), fornecedorId: doc.fornecedorId, documentoId }, 'reprovado', { motivo, observacao }),
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
          return { ...d, status: 'reprovado', pendenteDesde: ds.hoje, decisao: { por: VOCE, em: ds.agora, motivo, observacao } };
        }),
      };
    });
  }, []);

  /** Cada arquivo é decidido sozinho; os outros do envio não mudam. */
  const aprovarArquivo = useCallback((arquivoId: string) => {
    datasetStore.set((ds) => {
      const arq = ds.arquivos.find((a) => a.id === arquivoId);
      if (!arq) return ds;
      return {
        ...ds,
        analises: registrar(ds, { documento: arq.nome, fornecedorId: arq.fornecedorId, arquivoId }, 'aprovado'),
        arquivos: ds.arquivos.map((a) =>
          a.id === arquivoId ? { ...a, status: 'aprovado', validade: a.validadeInformada, decisao: { por: VOCE, em: ds.agora } } : a,
        ),
      };
    });
  }, []);

  const reprovarArquivo = useCallback((arquivoId: string, motivo: MotivoReprovacao, observacao: string) => {
    datasetStore.set((ds) => {
      const arq = ds.arquivos.find((a) => a.id === arquivoId);
      if (!arq) return ds;
      return {
        ...ds,
        analises: registrar(ds, { documento: arq.nome, fornecedorId: arq.fornecedorId, arquivoId }, 'reprovado', { motivo, observacao }),
        arquivos: ds.arquivos.map((a) =>
          a.id === arquivoId ? { ...a, status: 'reprovado', validade: undefined, decisao: { por: VOCE, em: ds.agora, motivo, observacao } } : a,
        ),
      };
    });
  }, []);

  return { aprovarDocumento, reprovarDocumento, aprovarArquivo, reprovarArquivo };
}
