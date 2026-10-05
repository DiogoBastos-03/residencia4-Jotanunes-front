import { useSearchParams } from 'react-router';
import type { MotivoReprovacao } from '@/entities';
import { type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { InfoNote, Stack, useToast } from '@/shared/ui';
import { useAvancar } from '../hooks/useAvancar';
import { useDecisoes } from '../hooks/useDecisoes';
import type { DetalheEnvioArquivos } from '../types';
import { ArquivosTabela } from './ArquivosTabela';
import { DrawerArquivo } from './DrawerArquivo';
import { EnvioResumo } from './EnvioResumo';
import { ModalReprovarArquivo } from './ModalReprovarArquivo';

const t = strings.pages.envio;

/**
 * Arquivos de um envio, cada um decidido sozinho. Quando o último em análise é decidido,
 * avança para o próximo pendente da origem. A URL abre direto ?arquivo= e ?reprovar= (usado em /_estados).
 */
export function AnaliseEnvio({ detalhe, origem }: { detalhe: DetalheEnvioArquivos; origem: Origem }) {
  const [params, setParams] = useSearchParams();
  const { aprovarArquivo, reprovarArquivo } = useDecisoes();
  const avancar = useAvancar(origem, detalhe.envio.id);
  const { showToast } = useToast();
  const arquivoAberto = params.get('arquivo');
  const reprovando = params.get('reprovar');

  const definir = (mudancas: Record<string, string | null>) =>
    setParams(
      (atual) => {
        const p = new URLSearchParams(atual);
        for (const [k, v] of Object.entries(mudancas)) {
          if (v === null) p.delete(k);
          else p.set(k, v);
        }
        return p;
      },
      { replace: true },
    );

  const nomeDe = (id: string) => detalhe.arquivos.find((a) => a.arquivo.id === id)?.arquivo.nome ?? '';
  const ultimoEmAnalise = (id: string) => detalhe.arquivos.filter((a) => a.arquivo.status === 'emAnalise' && a.arquivo.id !== id).length === 0;

  /** Decide um arquivo; se era o último em análise do envio, segue para o próximo pendente. */
  function decidir(id: string, mudanca: () => void, texto: string) {
    definir({ arquivo: null, reprovar: null });
    if (ultimoEmAnalise(id)) {
      avancar(mudanca, `${texto} ${t.envioAnalisado}`);
      return;
    }
    mudanca();
    showToast(texto);
  }

  const aprovar = (id: string) => decidir(id, () => aprovarArquivo(id), t.aprovadoToast(nomeDe(id)));
  const reprovar = (id: string, motivo: MotivoReprovacao, observacao: string) =>
    decidir(id, () => reprovarArquivo(id, motivo, observacao), t.reprovadoToast(nomeDe(id)));

  const existe = (id: string | null) => id !== null && detalhe.arquivos.some((a) => a.arquivo.id === id);

  return (
    <Stack>
      <EnvioResumo resumo={detalhe.resumoEnvio} />
      <InfoNote>
        {t.resumoItem(strings.dominio.resumoArquivos(detalhe.resumoItem))} {detalhe.emAnalise ? t.nota : t.leituraNota}
      </InfoNote>
      <ArquivosTabela
        arquivos={detalhe.arquivos}
        comValidade={detalhe.exigido.item.validade === 'comData'}
        onVisualizar={(id) => definir({ arquivo: id })}
        onAprovar={aprovar}
        onReprovar={(id) => definir({ reprovar: id })}
      />
      <DrawerArquivo
        detalhe={detalhe}
        arquivoId={existe(arquivoAberto) ? arquivoAberto : null}
        onClose={() => definir({ arquivo: null })}
        onAprovar={aprovar}
        onReprovar={(id) => definir({ reprovar: id })}
      />
      <ModalReprovarArquivo
        nome={reprovando && existe(reprovando) ? nomeDe(reprovando) : null}
        onClose={() => definir({ reprovar: null })}
        onConfirm={(motivo, observacao) => reprovando && reprovar(reprovando, motivo, observacao)}
      />
    </Stack>
  );
}
