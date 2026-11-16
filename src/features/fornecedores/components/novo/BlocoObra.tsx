import type { ObraResumo } from '@/entities';
import { strings } from '@/shared/strings';
import { Card, Field, Heading, Input, Select, Text } from '@/shared/ui';
import type { BlocoProps } from './types';

const t = strings.pages.fornecedorNovo.obra;

/** Obra opcional: o vínculo é a segunda chamada, depois do cadastro. Só obras da API. */
export function BlocoObra({ dados, erros, onChange, obras }: BlocoProps & { obras: readonly ObraResumo[] }) {
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <Text size="support" tone="muted" className="mt-1">
        {t.description}
      </Text>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Field label={t.obra}>
          {(control) => (
            <Select
              {...control}
              value={dados.obraId}
              onChange={(e) => onChange({ obraId: e.target.value, ...(e.target.value ? {} : { prazoDias: '' }) })}
              options={[{ value: '', label: t.nenhuma }, ...obras.map((o) => ({ value: o.id, label: o.nome }))]}
            />
          )}
        </Field>
        {dados.obraId && (
          <Field label={t.prazo} hint={t.prazoHint} error={erros.prazo}>
            {(control) => (
              <Input {...control} inputMode="numeric" value={dados.prazoDias} onChange={(e) => onChange({ prazoDias: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
            )}
          </Field>
        )}
      </div>
    </Card>
  );
}
