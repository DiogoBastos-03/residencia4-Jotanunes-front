import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Card, Field, Heading, Input, Select, Tag, Text } from '@/shared/ui';
import type { ObraParaCadastro } from '../../types';
import type { BlocoProps } from './types';

const t = strings.pages.fornecedorNovo.obra;

export function BlocoObra({ dados, erros, onChange, obras }: BlocoProps & { obras: readonly ObraParaCadastro[] }) {
  const escolhida = obras.find((o) => o.obra.id === dados.obraId);
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
              onChange={(e) => onChange({ obraId: e.target.value })}
              options={[{ value: '', label: t.nenhuma }, ...obras.map((o) => ({ value: o.obra.id, label: t.opcao(o.obra.nome, o.obra.codigo) }))]}
            />
          )}
        </Field>
        <Field label={t.servico} error={erros.servico}>
          {(control) => (
            <Input
              {...control}
              disabled={!escolhida}
              placeholder={t.servicoPlaceholder}
              value={dados.servicoContratado}
              onChange={(e) => onChange({ servicoContratado: e.target.value })}
            />
          )}
        </Field>
      </div>
      {escolhida && (
        <div className="mt-4">
          <Text size="label" weight="medium" tone="soft" className="mb-2">
            {t.listas}
          </Text>
          {escolhida.listas.length === 0 ? (
            <Text size="support" tone="muted">
              {t.semListas}
            </Text>
          ) : (
            <ul className="overflow-hidden rounded-control border border-border">
              {escolhida.listas.map((lista) => {
                const aplica = lista.tipo === dados.tipo;
                return (
                  <li key={lista.id} className="flex items-center gap-2.5 border-b border-border px-4 py-3 last:border-b-0">
                    <Text weight="medium" className={cn('min-w-0 flex-1', !aplica && 'text-ink-4')}>
                      {lista.nome}
                    </Text>
                    {aplica ? <Tag kind="vaiSeAplicar">{t.aplica}</Tag> : <Tag kind="naoSeAplica">{t.naoAplica(strings.status[lista.tipo])}</Tag>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
