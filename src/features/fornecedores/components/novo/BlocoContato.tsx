import { formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Card, Checkbox, Field, Heading, Input } from '@/shared/ui';
import type { BlocoProps } from './types';

const t = strings.pages.fornecedorNovo.contato;

export function BlocoContato({ dados, erros, onChange }: BlocoProps) {
  const contato = (parcial: Partial<BlocoProps['dados']['contato']>) => onChange({ contato: { ...dados.contato, ...parcial } });
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Field label={t.nome} error={erros.contatoNome}>
          {(control) => <Input {...control} value={dados.contato.nome} onChange={(e) => contato({ nome: e.target.value })} />}
        </Field>
        <Field label={t.cargo}>
          {(control) => <Input {...control} value={dados.contato.cargo} onChange={(e) => contato({ cargo: e.target.value })} />}
        </Field>
        <Field label={t.email} hint={t.emailHint} error={erros.email}>
          {(control) => <Input {...control} type="email" value={dados.contato.email} onChange={(e) => contato({ email: e.target.value })} />}
        </Field>
        <Field label={t.telefone}>
          {(control) => (
            <Input
              {...control}
              inputMode="tel"
              placeholder={t.telefonePlaceholder}
              value={formatPhone(dados.contato.telefone)}
              onChange={(e) => contato({ telefone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            />
          )}
        </Field>
      </div>
      <Checkbox
        className="mt-4"
        label={t.convite}
        description={t.conviteHint}
        checked={dados.enviarConvite}
        onChange={(e) => onChange({ enviarConvite: e.target.checked })}
      />
    </Card>
  );
}
