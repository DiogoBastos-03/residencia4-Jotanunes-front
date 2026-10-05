import { strings } from '@/shared/strings';
import { Card, ChoiceCard, Heading, Text } from '@/shared/ui';
import type { BlocoProps } from './types';

const t = strings.pages.fornecedorNovo.tipo;

export function BlocoTipo({ dados, onChange }: BlocoProps) {
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div role="radiogroup" aria-label={t.title} className="mt-3 grid items-stretch gap-3 lg:grid-cols-2">
        <ChoiceCard name="tipo-fornecedor" value="servico" checked={dados.tipo === 'servico'} onChange={() => onChange({ tipo: 'servico' })} title={t.servico} description={t.servicoDesc} />
        <ChoiceCard name="tipo-fornecedor" value="material" checked={dados.tipo === 'material'} onChange={() => onChange({ tipo: 'material' })} title={t.material} description={t.materialDesc} />
      </div>
      <Text size="support" tone="faint" className="mt-2">
        {t.nota}
      </Text>
    </Card>
  );
}
