import { useRef } from 'react';
import { formatCpf, formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, Card, Drawer, InfoNote, KeyValueList, Mono, Skeleton, SkeletonBlock, Stack, Text, useToast } from '@/shared/ui';
import { useDecisoesFuncionario } from '../hooks/useDecisoesFuncionario';
import { useFuncionario } from '../hooks/useFuncionario';
import { DocumentoDaPessoaLinha } from './DocumentoDaPessoaLinha';

const t = strings.pages.remessa.drawer;

type FuncionarioDrawerProps = {
  /** Pessoa aberta; null fecha o drawer. */
  funcionarioId: string | null;
  onClose: () => void;
};

/** Dados e documentos de uma pessoa da remessa, com a decisão por documento. */
export function FuncionarioDrawer({ funcionarioId, onClose }: FuncionarioDrawerProps) {
  // Mantém a última pessoa enquanto o drawer anima a saída.
  const ultimo = useRef<string | null>(null);
  if (funcionarioId) ultimo.current = funcionarioId;
  const query = useFuncionario(funcionarioId ?? ultimo.current);
  const { decidirDocumento, concluirFuncionario } = useDecisoesFuncionario();
  const { showToast } = useToast();
  const ficha = query.data;
  const decidivel = ficha?.remessa.situacao === 'emAnalise' && ficha.funcionario.status === 'emAnalise';
  const pendentes = ficha?.documentos.filter((d) => d.status === 'emAnalise').length ?? 0;

  return (
    <Drawer
      open={funcionarioId !== null}
      onClose={onClose}
      title={ficha?.funcionario.nome ?? <Skeleton className="h-4 w-48" />}
      subtitle={ficha?.fornecedor.razaoSocial}
      footer={
        decidivel ? (
          <>
            <Button variant="tertiary" onClick={onClose}>
              {t.cancelar}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!ficha) return;
                concluirFuncionario(ficha.funcionario.id);
                onClose();
                showToast(t.concluido);
              }}
            >
              {t.concluir}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>{t.fechar}</Button>
        )
      }
    >
      <AsyncContent query={query} skeleton={<SkeletonBlock rows={4} />} isEmpty={(f) => f === null} empty={null}>
        {(f) =>
          f && (
            <Stack gap="lg">
              <Card>
                <KeyValueList
                  layout="stacked"
                  items={[
                    { key: 'cpf', label: t.cpf, value: <Mono>{formatCpf(f.funcionario.cpf)}</Mono> },
                    { key: 'tel', label: t.telefone, value: f.funcionario.telefone },
                    { key: 'funcao', label: t.funcao, value: f.funcionario.funcao },
                    { key: 'obra', label: t.obra, value: f.obra.nome },
                    {
                      key: 'remessa',
                      label: t.remessaOrigem,
                      value: t.remessaOrigemValor(f.remessaTamanho, formatDate(f.remessa.enviadaEm, 'date')),
                      full: true,
                    },
                    { key: 'item', label: t.itemOrigem, value: t.itemOrigemValor(f.item.nome, f.lista.nome), full: true },
                  ]}
                />
              </Card>
              <div>
                <Text size="label" weight="medium" tone="soft" className="mb-2">
                  {t.documentos}
                </Text>
                <ul className="overflow-hidden rounded-control border border-border">
                  {f.documentos.map((documento) => (
                    <DocumentoDaPessoaLinha
                      key={documento.exigido.id}
                      documento={documento}
                      decidivel={decidivel}
                      onDecidir={(status) => decidirDocumento(f.funcionario.id, documento.exigido.id, status)}
                    />
                  ))}
                </ul>
              </div>
              {decidivel && pendentes > 0 && <InfoNote>{t.pendentesAviso(pendentes)}</InfoNote>}
              {!decidivel && <InfoNote>{t.jaConcluido}</InfoNote>}
            </Stack>
          )
        }
      </AsyncContent>
    </Drawer>
  );
}
