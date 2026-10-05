import { strings } from '@/shared/strings';
import { Card, Field, Heading, InfoNote, Select } from '@/shared/ui';
import type { NovaLista } from '../../types';

const t = strings.pages.novaLista.prazo;
const PRAZOS = [15, 30, 60] as const;
const LEMBRETES: Record<string, number[]> = { tres: [15, 7, 2], dois: [7, 2], nenhum: [] };

function chaveLembretes(dias: readonly number[]): string {
  return Object.entries(LEMBRETES).find(([, v]) => v.join() === dias.join())?.[0] ?? 'tres';
}

export function BlocoPrazoLista({ dados, onChange }: { dados: NovaLista; onChange: (p: Partial<NovaLista>) => void }) {
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2">
        <Field label={t.prazo}>
          {(control) => (
            <Select
              {...control}
              value={String(dados.prazoEnvioDias)}
              onChange={(e) => onChange({ prazoEnvioDias: Number(e.target.value) })}
              options={PRAZOS.map((d) => ({ value: String(d), label: t.prazos(d) }))}
            />
          )}
        </Field>
        <Field label={t.lembretes}>
          {(control) => (
            <Select
              {...control}
              value={chaveLembretes(dados.lembretesDias)}
              onChange={(e) => onChange({ lembretesDias: LEMBRETES[e.target.value] ?? [] })}
              options={[
                { value: 'tres', label: t.lembretesOpcoes.tres },
                { value: 'dois', label: t.lembretesOpcoes.dois },
                { value: 'nenhum', label: t.lembretesOpcoes.nenhum },
              ]}
            />
          )}
        </Field>
      </div>
      <InfoNote title={t.notaTitle} className="mt-3">
        {t.nota}
      </InfoNote>
    </Card>
  );
}
