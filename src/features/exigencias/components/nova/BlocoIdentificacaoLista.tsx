import type { SituacaoLista } from '@/entities';
import { strings } from '@/shared/strings';
import { Card, ChoiceCard, Field, Heading, Input, Select, Text, Textarea } from '@/shared/ui';
import type { NovaLista } from '../../types';

const t = strings.pages.novaLista.identificacao;

type Props = { dados: NovaLista; erroNome: string | undefined; onChange: (p: Partial<NovaLista>) => void; onTipo: (tipo: NovaLista['tipo']) => void };

export function BlocoIdentificacaoLista({ dados, erroNome, onChange, onTipo }: Props) {
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2">
        <Field label={t.nome} error={erroNome}>
          {(control) => <Input {...control} placeholder={t.nomePlaceholder} value={dados.nome} onChange={(e) => onChange({ nome: e.target.value })} />}
        </Field>
        <Field label={t.situacao}>
          {(control) => (
            <Select
              {...control}
              value={dados.situacao}
              onChange={(e) => onChange({ situacao: e.target.value === 'rascunho' ? 'rascunho' : ('ativo' satisfies SituacaoLista) })}
              options={[
                { value: 'ativo', label: t.situacoes.ativo },
                { value: 'rascunho', label: t.situacoes.rascunho },
              ]}
            />
          )}
        </Field>
      </div>
      <Text size="label" weight="medium" tone="soft" className="mt-3 mb-1.5">
        {t.tipo}
      </Text>
      <div role="radiogroup" aria-label={t.tipo} className="grid items-stretch gap-3 lg:grid-cols-2">
        <ChoiceCard name="tipo-lista" value="servico" checked={dados.tipo === 'servico'} onChange={() => onTipo('servico')} title={t.servico} description={t.servicoDesc} />
        <ChoiceCard name="tipo-lista" value="material" checked={dados.tipo === 'material'} onChange={() => onTipo('material')} title={t.material} description={t.materialDesc} />
      </div>
      <Text size="support" tone="faint" className="mt-2">
        {t.tipoNota}
      </Text>
      <Field label={t.descricao} className="mt-3">
        {(control) => (
          <Textarea {...control} rows={2} placeholder={t.descricaoPlaceholder} value={dados.descricao} onChange={(e) => onChange({ descricao: e.target.value })} />
        )}
      </Field>
    </Card>
  );
}
