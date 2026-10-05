import { formatCnpj } from '@/shared/lib';
import { strings } from '@/shared/strings';
import {
  Badge,
  Block,
  BlockRow,
  Button,
  Card,
  Grid,
  Heading,
  KeyValueList,
  Metric,
  MetricStrip,
  Mono,
  Stack,
  Table,
  Text,
  type TableColumn,
} from '@/shared/ui';

const t = strings.pages.componentes;

type Row = (typeof t.table.rows)[number];

const METRIC_TONES = ['warn', 'review', 'ok', 'warn'] as const;

const columns: readonly TableColumn<Row>[] = [
  { key: 'nome', header: t.table.columns.fornecedor, cell: (r) => r.nome, tone: 'strong', mobile: 'title' },
  { key: 'cnpj', header: t.table.columns.cnpj, cell: (r) => <Mono>{formatCnpj(r.cnpj)}</Mono>, nowrap: true },
  { key: 'tipo', header: t.table.columns.tipo, cell: (r) => <Badge status={r.tipo} /> },
  { key: 'docs', header: t.table.columns.documentos, cell: (r) => r.docs },
  { key: 'situacao', header: t.table.columns.situacao, cell: (r) => <Badge status={r.situacao} />, mobile: 'badge' },
];

export function DataSection() {
  return (
    <>
      <section aria-label={t.sections.metrics}>
        <Stack gap="sm">
          <Heading>{t.sections.metrics}</Heading>
          <MetricStrip>
            {t.metrics.map((m, i) => (
              <Metric
                key={m.key}
                label={m.label}
                value={m.value}
                hint={m.hint}
                tone={METRIC_TONES[i]}
                highlight={i === 0}
              />
            ))}
          </MetricStrip>
        </Stack>
      </section>

      <section aria-label={t.sections.blocks}>
        <Stack gap="sm">
          <Heading>{t.sections.blocks}</Heading>
          <Grid>
            <Block title={t.blocks.priority} action={<Button variant="link">{t.blocks.priorityAction}</Button>}>
              {t.blocks.rows.map((row) => (
                <BlockRow key={row.key}>
                  <div className="min-w-0 flex-1">
                    <Text weight="medium">{row.title}</Text>
                    <Text size="support" tone="muted" className="mt-0.5">
                      {row.meta}
                    </Text>
                  </div>
                  <Badge status="urgente" />
                </BlockRow>
              ))}
            </Block>
            <Card>
              <Heading>{t.blocks.contact}</Heading>
              <KeyValueList items={t.blocks.contactItems} className="mt-3" />
            </Card>
          </Grid>
          <Card muted>
            <Text weight="semibold">{t.blocks.cardTitle}</Text>
            <Text size="support" tone="muted" className="mt-1">
              {t.blocks.cardBody} {t.blocks.heightNote}
            </Text>
          </Card>
        </Stack>
      </section>

      <section aria-label={t.sections.table}>
        <Stack gap="sm">
          <Heading>{t.sections.table}</Heading>
          <Table
            caption={t.table.caption}
            columns={columns}
            rows={t.table.rows}
            rowKey={(r) => r.id}
            action={{ label: () => t.table.action, describe: (r) => r.nome, onClick: () => undefined }}
          />
        </Stack>
      </section>
    </>
  );
}
