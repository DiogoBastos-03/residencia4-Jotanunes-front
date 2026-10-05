import { useEffect, useState } from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { cn, formatCnpj, formatDate, maskMonthBr, parseMonthBr } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, Drawer, EmptyState, Field, Inline, Input, Mono, Select, Stack, Tag, Text, useToast } from '@/shared/ui';
import { useExemplosObra } from '../hooks/useExemplosObra';
import { useVinculosObra } from '../hooks/useVinculosObra';
import type { FichaObra } from '../types';

const t = strings.pages.obra.drawerFornecedor;

type Props = {
  ficha: FichaObra;
  open: boolean;
  /** Abre com os campos vazios (estado vazio do formulário). */
  vazio: boolean;
  onClose: () => void;
  onVinculado: () => void;
};

export function DrawerVincularFornecedor({ ficha, open, vazio, onClose, onVinculado }: Props) {
  const exemplo = useExemplosObra().vinculoFornecedor;
  const { vincularFornecedor } = useVinculosObra();
  const { showToast } = useToast();
  const disponiveis = [...ficha.fornecedoresDisponiveis].sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR'));
  const padrao = disponiveis.find((f) => f.id === exemplo.fornecedorId) ?? disponiveis[0];

  const [fornecedorId, setFornecedorId] = useState('');
  const [servico, setServico] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [erros, setErros] = useState<{ servico?: string; periodo?: string }>({});

  // Ao abrir, preenche com o exemplo (ou deixa vazio).
  useEffect(() => {
    if (!open) return;
    const comExemplo = !vazio && padrao?.id === exemplo.fornecedorId;
    setFornecedorId(padrao?.id ?? '');
    setServico(comExemplo ? exemplo.servicoContratado : '');
    setInicio(comExemplo ? formatDate(exemplo.inicio, 'monthYear') : '');
    setFim(comExemplo ? formatDate(exemplo.fim, 'monthYear') : '');
    setErros({});
    // Só ao abrir: o resto das dependências muda junto com a ficha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vazio]);

  const fornecedor = disponiveis.find((f) => f.id === fornecedorId);
  const aplicam = ficha.listas.filter((l) => l.lista.tipo === fornecedor?.tipo).map((l) => l.lista.nome);
  const outroTipo = fornecedor?.tipo === 'servico' ? strings.dominio.tipo.material : strings.dominio.tipo.servico;

  function confirmar() {
    if (!fornecedor) return;
    const ini = parseMonthBr(inicio);
    const fi = parseMonthBr(fim);
    const novosErros = {
      servico: servico.trim() === '' ? t.servicoErro : undefined,
      periodo: !ini || !fi || fi < ini ? t.periodoErro : undefined,
    };
    setErros(novosErros);
    if (novosErros.servico || novosErros.periodo || !ini || !fi) return;
    vincularFornecedor({ obraId: ficha.obra.id, fornecedorId: fornecedor.id, servicoContratado: servico.trim(), inicio: ini, fim: fi });
    showToast(t.toast);
    onVinculado();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t.title}
      subtitle={t.subtitle(ficha.obra.nome, ficha.obra.codigo)}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            {t.cancelar}
          </Button>
          <Button variant="primary" onClick={confirmar} disabled={!fornecedor}>
            {t.confirmar}
          </Button>
        </>
      }
    >
      {disponiveis.length === 0 ? (
        <EmptyState framed={false} icon={BuildingStorefrontIcon} title={t.todosVinculadosTitle} description={t.todosVinculadosDescription} />
      ) : (
        <Stack>
          <Field label={t.fornecedor}>
            {(control) => (
              <Select
                {...control}
                options={disponiveis.map((f) => ({ value: f.id, label: f.razaoSocial }))}
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
              />
            )}
          </Field>
          {fornecedor && (
            <Inline gap="sm">
              <Text weight="medium">{fornecedor.razaoSocial}</Text>
              <Badge status={fornecedor.tipo} />
              <Mono>{formatCnpj(fornecedor.cnpj)}</Mono>
            </Inline>
          )}
          <Field label={t.servico} error={erros.servico}>
            {(control) => (
              <Input {...control} placeholder={t.servicoPlaceholder} value={servico} onChange={(e) => setServico(e.target.value)} />
            )}
          </Field>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.inicio}>
                {(control) => (
                  <Input
                    {...control}
                    invalid={Boolean(erros.periodo)}
                    inputMode="numeric"
                    placeholder={t.mesPlaceholder}
                    value={inicio}
                    onChange={(e) => setInicio(maskMonthBr(e.target.value))}
                  />
                )}
              </Field>
              <Field label={t.fim}>
                {(control) => (
                  <Input
                    {...control}
                    invalid={Boolean(erros.periodo)}
                    inputMode="numeric"
                    placeholder={t.mesPlaceholder}
                    value={fim}
                    onChange={(e) => setFim(maskMonthBr(e.target.value))}
                  />
                )}
              </Field>
            </div>
            {erros.periodo && (
              <Text size="label" className="mt-1.5 text-danger" role="alert">
                {erros.periodo}
              </Text>
            )}
          </div>
          <div>
            <Text size="label" weight="medium" tone="soft" className="mb-2">
              {t.listas}
            </Text>
            {ficha.listas.length === 0 ? (
              <Text size="support" tone="muted">
                {t.semListas}
              </Text>
            ) : (
              <>
                <ul className="overflow-hidden rounded-control border border-border">
                  {ficha.listas.map(({ lista }) => {
                    const aplica = lista.tipo === fornecedor?.tipo;
                    return (
                      <li key={lista.id} className="flex items-center gap-2.5 border-b border-border px-4 py-3 last:border-b-0">
                        <Text weight="medium" className={cn('min-w-0 flex-1', !aplica && 'text-ink-4')}>
                          {lista.nome}
                        </Text>
                        {aplica ? (
                          <Tag kind="vaiSeAplicar">{t.vaiSeAplicar}</Tag>
                        ) : (
                          <Tag kind="naoSeAplica">{t.naoSeAplica(strings.status[lista.tipo])}</Tag>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <Text size="label" tone="faint" className="mt-1.5">
                  {t.calculado}
                </Text>
              </>
            )}
          </div>
          {fornecedor && (
            <div className="rounded-control border border-border px-4 py-3">
              <Text size="label" weight="medium" tone="soft">
                {t.resumo}
              </Text>
              <Text className="mt-1 leading-[1.35]">
                {t.resumoTexto(
                  fornecedor.razaoSocial,
                  strings.dominio.tipo[fornecedor.tipo],
                  aplicam,
                  ficha.listas.length,
                  outroTipo,
                  ficha.listas.length - aplicam.length,
                )}
              </Text>
            </div>
          )}
          <div>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setServico('');
                setInicio('');
                setFim('');
                setErros({});
              }}
            >
              {t.limpar}
            </Button>
          </div>
        </Stack>
      )}
    </Drawer>
  );
}
