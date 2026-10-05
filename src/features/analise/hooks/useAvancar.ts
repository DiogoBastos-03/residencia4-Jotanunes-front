import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { paths, type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { useToast } from '@/shared/ui';
import { proximoPendente, rotaDoAlvo, textoFim } from '../lib';
import { sequenciaAgora } from './useSequencia';

/**
 * Depois de decidir: vai para o próximo pendente da mesma origem e mostra o toast.
 * Só quando não sobra nada pendente volta para a origem, avisando que terminou.
 * A sequência é lida antes da mudança, para o "próximo" ser o próximo de onde você estava.
 */
export function useAvancar(origem: Origem, atualId: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  return useCallback(
    (mudanca: () => void, decisao: string) => {
      const antes = sequenciaAgora(origem, atualId);
      mudanca();
      const proximo = proximoPendente(antes.alvos, atualId);
      if (proximo) {
        navigate(rotaDoAlvo(proximo, origem));
        showToast(strings.pages.analise.avanco.proximo(decisao));
      } else {
        navigate(paths.origem(origem));
        showToast(textoFim(origem, decisao));
      }
    },
    [origem, atualId, navigate, showToast],
  );
}
