import { XCircleIcon } from '@heroicons/react/24/outline';
import type { MotivoReprovacao } from '@/entities';
import { strings } from '@/shared/strings';
import { Button, Card, Field, Heading, Inline, Select, Textarea } from '@/shared/ui';

const t = strings.pages.analise.reprovacao;

const CHAVES: readonly MotivoReprovacao[] = ['ilegivel', 'foraValidade', 'incorreto', 'faltaAssinatura'];
const MOTIVOS = CHAVES.map((value) => ({ value, label: strings.dominio.motivos[value] }));

function ehMotivo(valor: string): valor is MotivoReprovacao {
  return MOTIVOS.some((m) => m.value === valor);
}

type PainelReprovacaoProps = {
  motivo: MotivoReprovacao;
  observacao: string;
  erroObservacao: string | null;
  onMotivo: (motivo: MotivoReprovacao) => void;
  onObservacao: (texto: string) => void;
  onLimpar: () => void;
  onCancelar: () => void;
  onConfirmar: () => void;
};

/** Motivo + observação para o fornecedor. */
export function PainelReprovacao(props: PainelReprovacaoProps) {
  const { motivo, observacao, erroObservacao, onMotivo, onObservacao, onLimpar, onCancelar, onConfirmar } = props;
  return (
    <Card>
      <Inline justify="between">
        <Heading>{t.title}</Heading>
        {observacao !== '' && (
          <Button variant="link" size="sm" onClick={onLimpar}>
            {t.limpar}
          </Button>
        )}
      </Inline>
      <Field label={t.motivo} className="mt-3">
        {(control) => (
          <Select
            {...control}
            options={MOTIVOS}
            value={motivo}
            onChange={(e) => {
              if (ehMotivo(e.target.value)) onMotivo(e.target.value);
            }}
          />
        )}
      </Field>
      <Field label={t.observacao} hint={t.observacaoHint} error={erroObservacao} className="mt-3">
        {(control) => (
          <Textarea
            {...control}
            rows={4}
            placeholder={t.observacaoPlaceholder}
            value={observacao}
            onChange={(e) => onObservacao(e.target.value)}
          />
        )}
      </Field>
      <div className="mt-3 flex gap-2">
        <Button variant="tertiary" className="flex-1" onClick={onCancelar}>
          {t.cancelar}
        </Button>
        <Button variant="primary" icon={XCircleIcon} className="flex-[1.6]" onClick={onConfirmar}>
          {t.confirmar}
        </Button>
      </div>
    </Card>
  );
}
