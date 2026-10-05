import { formatCnpj } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Card, Field, Heading, Input } from '@/shared/ui';
import type { BlocoProps } from './types';

const t = strings.pages.fornecedorNovo.identificacao;

export function BlocoIdentificacao({ dados, erros, onChange }: BlocoProps) {
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,1fr)]">
        <Field label={t.cnpj} error={erros.cnpj}>
          {(control) => (
            <Input
              {...control}
              mono
              inputMode="numeric"
              placeholder={t.cnpjPlaceholder}
              value={formatCnpj(dados.cnpj)}
              onChange={(e) => onChange({ cnpj: e.target.value.replace(/\D/g, '').slice(0, 14) })}
            />
          )}
        </Field>
        <Field label={t.razao} error={erros.razaoSocial}>
          {(control) => <Input {...control} value={dados.razaoSocial} onChange={(e) => onChange({ razaoSocial: e.target.value })} />}
        </Field>
        <Field label={t.fantasia}>
          {(control) => <Input {...control} value={dados.nomeFantasia} onChange={(e) => onChange({ nomeFantasia: e.target.value })} />}
        </Field>
      </div>
    </Card>
  );
}
