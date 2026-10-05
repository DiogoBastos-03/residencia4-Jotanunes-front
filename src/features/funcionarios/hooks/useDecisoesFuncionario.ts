import { useCallback } from 'react';
import type { StatusEnvio } from '@/entities';
import { datasetStore } from '@/mocks';

/** Decisões sobre as pessoas de uma remessa. O item de funcionários é acompanhado por pessoa. */
export function useDecisoesFuncionario() {
  const decidirDocumento = useCallback((funcionarioId: string, documentoExigidoId: string, status: StatusEnvio) => {
    datasetStore.set((ds) => ({
      ...ds,
      funcionarios: ds.funcionarios.map((f) =>
        f.id !== funcionarioId
          ? f
          : { ...f, documentos: f.documentos.map((d) => (d.documentoExigidoId === documentoExigidoId ? { ...d, status } : d)) },
      ),
    }));
  }, []);

  /** Documentos ainda em análise são aprovados; a pessoa fica reprovada se algum documento foi reprovado. */
  const concluirFuncionario = useCallback((funcionarioId: string) => {
    datasetStore.set((ds) => ({
      ...ds,
      funcionarios: ds.funcionarios.map((f) => {
        if (f.id !== funcionarioId) return f;
        const documentos = f.documentos.map((d) => (d.status === 'emAnalise' ? { ...d, status: 'aprovado' as const } : d));
        return { ...f, documentos, status: documentos.some((d) => d.status === 'reprovado') ? 'reprovado' : 'aprovado' };
      }),
    }));
  }, []);

  return { decidirDocumento, concluirFuncionario };
}
