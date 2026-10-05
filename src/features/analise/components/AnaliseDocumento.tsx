import { useState } from 'react';
import { useSearchParams } from 'react-router';
import type { MotivoReprovacao } from '@/entities';
import { diasEntre } from '@/entities';
import { isoToBr, parseDateBr, type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { useAvancar } from '../hooks/useAvancar';
import { useDecisoes } from '../hooks/useDecisoes';
import { useExemploReprovacao } from '../hooks/useExemploReprovacao';
import type { DetalheDocumento } from '../types';
import { DadosDoEnvio } from './DadosDoEnvio';
import { DocumentViewer } from './DocumentViewer';
import { EnviosAnteriores } from './EnviosAnteriores';
import { ModalAprovar } from './ModalAprovar';
import { ModalReprovar } from './ModalReprovar';
import { PainelDecisao } from './PainelDecisao';
import { PainelLeitura } from './PainelLeitura';
import { PainelReprovacao } from './PainelReprovacao';

const t = strings.pages.analise;

type Modo = 'decidindo' | 'reprovando';
type ModalAberto = 'aprovar' | 'reprovar' | null;

type Props = { detalhe: DetalheDocumento; hoje: string; origem: Origem };

/**
 * Visualizador à esquerda, dados e decisão à direita. Documento já decidido abre em modo leitura.
 * Ao decidir, avança para o próximo pendente da mesma origem.
 * A URL pode abrir direto um estado (?painel=reprovar, ?modal=aprovar|reprovar, ?form=vazio) — usado em /_estados.
 */
export function AnaliseDocumento({ detalhe, hoje, origem }: Props) {
  const [params] = useSearchParams();
  const vazio = params.get('form') === 'vazio';
  const exemplo = useExemploReprovacao();
  const { aprovarDocumento, reprovarDocumento } = useDecisoes();
  const avancar = useAvancar(origem, detalhe.documento.id);

  const modalInicial = params.get('modal');
  const [modo, setModo] = useState<Modo>(params.get('painel') === 'reprovar' || modalInicial === 'reprovar' ? 'reprovando' : 'decidindo');
  const [modal, setModal] = useState<ModalAberto>(modalInicial === 'aprovar' || modalInicial === 'reprovar' ? modalInicial : null);
  const [validade, setValidade] = useState(vazio ? '' : isoToBr(detalhe.validadeInformada));
  const [erroValidade, setErroValidade] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<MotivoReprovacao>(exemplo.motivo);
  const [observacao, setObservacao] = useState(vazio ? '' : exemplo.observacao);
  const [erroObservacao, setErroObservacao] = useState<string | null>(null);

  const comValidade = detalhe.exigido.item.validade === 'comData';
  const validadeIso = parseDateBr(validade);

  function pedirAprovacao() {
    if (comValidade && (!validadeIso || diasEntre(hoje, validadeIso) <= 0)) {
      setErroValidade(t.decisao.validadeErro);
      return;
    }
    setErroValidade(null);
    setModal('aprovar');
  }

  function pedirReprovacao() {
    if (observacao.trim() === '') {
      setErroObservacao(t.reprovacao.observacaoErro);
      return;
    }
    setErroObservacao(null);
    setModal('reprovar');
  }

  function confirmarAprovacao() {
    setModal(null);
    avancar(() => aprovarDocumento(detalhe.documento.id, comValidade && validadeIso ? validadeIso : undefined), t.modalAprovar.toast);
  }

  function confirmarReprovacao() {
    setModal(null);
    avancar(() => reprovarDocumento(detalhe.documento.id, motivo, observacao.trim()), t.modalReprovar.toast);
  }

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_var(--spacing-review-aside)] lg:items-stretch">
      <DocumentViewer detalhe={detalhe} />
      {/* Grid (não flex): cada bloco fica com a altura do conteúdo, sem esticar nem cortar. */}
      <div className="grid min-w-0 content-start gap-3">
        <DadosDoEnvio detalhe={detalhe} />
        <EnviosAnteriores detalhe={detalhe} />
        {!detalhe.emAnalise ? (
          <PainelLeitura
            status={detalhe.status}
            decisao={detalhe.documento.decisao}
            validade={detalhe.documento.validade}
            semValidade={!comValidade}
          />
        ) : modo === 'decidindo' ? (
          <PainelDecisao
            comValidade={comValidade}
            validade={validade}
            erroValidade={erroValidade}
            onValidade={(valor) => {
              setValidade(valor);
              setErroValidade(null);
            }}
            onReprovar={() => setModo('reprovando')}
            onAprovar={pedirAprovacao}
          />
        ) : (
          <PainelReprovacao
            motivo={motivo}
            observacao={observacao}
            erroObservacao={erroObservacao}
            onMotivo={setMotivo}
            onObservacao={(texto) => {
              setObservacao(texto);
              setErroObservacao(null);
            }}
            onLimpar={() => setObservacao('')}
            onCancelar={() => setModo('decidindo')}
            onConfirmar={pedirReprovacao}
          />
        )}
      </div>
      <ModalAprovar
        open={modal === 'aprovar' && detalhe.emAnalise}
        documento={detalhe.exigido.nome}
        validade={comValidade ? validade : null}
        avisoDias={detalhe.exigido.item.avisoDias ?? 30}
        renovacao={detalhe.renovacao}
        onClose={() => setModal(null)}
        onConfirm={confirmarAprovacao}
      />
      <ModalReprovar
        open={modal === 'reprovar' && detalhe.emAnalise}
        renovacao={detalhe.renovacao}
        onClose={() => setModal(null)}
        onConfirm={confirmarReprovacao}
      />
    </div>
  );
}
