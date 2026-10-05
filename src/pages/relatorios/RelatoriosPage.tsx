import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useHoje } from '@/features/analise';
import { PendenciasPorObra, TemposDeAnalise, VencimentosTabela, ehPeriodo, exportarRelatorio, usePeriodo, useRelatorio } from '@/features/relatorios';
import { useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, PageHeader, Select, SkeletonBlock, SkeletonTable, Stack, useToast } from '@/shared/ui';

const t = strings.pages.relatorios;

export function RelatoriosPage() {
  useDocumentTitle(t.title);
  const [periodo, setPeriodo] = usePeriodo();
  const query = useRelatorio(periodo);
  const hoje = useHoje();
  const { showToast } = useToast();

  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Select
              aria-label={t.periodoLabel}
              wrapperClassName="w-48 max-sm:w-full"
              value={periodo}
              onChange={(e) => {
                if (ehPeriodo(e.target.value)) setPeriodo(e.target.value);
              }}
              options={[
                { value: '30d', label: t.periodos['30d'] },
                { value: '90d', label: t.periodos['90d'] },
                { value: 'ano', label: t.periodos.ano },
              ]}
            />
            <Button
              icon={ArrowDownTrayIcon}
              disabled={!query.data}
              onClick={() => {
                if (!query.data) return;
                exportarRelatorio(query.data, hoje);
                showToast(t.exportadoToast);
              }}
            >
              {t.exportar}
            </Button>
          </>
        }
      />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <SkeletonBlock rows={3} />
            <SkeletonBlock rows={4} />
            <SkeletonTable rows={6} columns={5} />
          </Stack>
        }
      >
        {(relatorio) => (
          <Stack>
            <PendenciasPorObra linhas={relatorio.pendencias} />
            <TemposDeAnalise tempos={relatorio.tempos} />
            <VencimentosTabela vencimentos={relatorio.vencimentos} />
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
}
