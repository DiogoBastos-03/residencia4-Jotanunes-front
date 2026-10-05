import { formatCnpj, formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Card, Field, Heading, Input } from '@/shared/ui';
import type { BlocoProps } from './types';

const t = strings.pages.fornecedorNovo.identificacao;

/** Identificação da empresa: tudo o que a API guarda dela, menos o tipo. */
export function BlocoIdentificacao({ dados, erros, onChange }: BlocoProps) {
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
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
        <Field label={t.telefone} error={erros.telefone}>
          {(control) => (
            <Input
              {...control}
              inputMode="tel"
              placeholder={t.telefonePlaceholder}
              value={formatPhone(dados.telefone)}
              onChange={(e) => onChange({ telefone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            />
          )}
        </Field>
        <Field label={t.email} error={erros.email}>
          {(control) => <Input {...control} type="email" value={dados.email} onChange={(e) => onChange({ email: e.target.value })} />}
        </Field>
      </div>
    </Card>
  );
}
