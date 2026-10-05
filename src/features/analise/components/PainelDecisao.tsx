import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { maskDateBr } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button, Card, Field, Heading, Inline, Input, Text } from '@/shared/ui';

const t = strings.pages.analise.decisao;

type PainelDecisaoProps = {
  comValidade: boolean;
  validade: string;
  erroValidade: string | null;
  onValidade: (valor: string) => void;
  onReprovar: () => void;
  onAprovar: () => void;
};

/** Validade + Reprovar / Aprovar. */
export function PainelDecisao({ comValidade, validade, erroValidade, onValidade, onReprovar, onAprovar }: PainelDecisaoProps) {
  return (
    <Card>
      <Inline justify="between">
        <Heading>{t.title}</Heading>
        {comValidade && validade !== '' && (
          <Button variant="link" size="sm" onClick={() => onValidade('')}>
            {t.limpar}
          </Button>
        )}
      </Inline>
      {comValidade ? (
        <Field label={t.validade} hint={t.validadeHint} error={erroValidade} className="mt-3">
          {(control) => (
            <Input
              {...control}
              inputMode="numeric"
              placeholder={t.validadePlaceholder}
              value={validade}
              onChange={(e) => onValidade(maskDateBr(e.target.value))}
            />
          )}
        </Field>
      ) : (
        <Text size="support" tone="muted" className="mt-3">
          {t.semValidade}
        </Text>
      )}
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" icon={XCircleIcon} className="flex-1" onClick={onReprovar}>
          {t.reprovar}
        </Button>
        <Button variant="primary" icon={CheckCircleIcon} className="flex-[1.4]" onClick={onAprovar}>
          {t.aprovar}
        </Button>
      </div>
    </Card>
  );
}
