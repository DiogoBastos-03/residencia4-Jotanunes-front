import { PlusIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { AlertBox, Button, Card, Heading, Inline, Text } from '@/shared/ui';
import type { ItemRascunho, NovaLista } from '../../types';
import { ItensTabela } from '../ItensTabela';

const t = strings.pages.novaLista.itens;
const l = strings.pages.lista;

type Props = {
  dados: NovaLista;
  erro: string | undefined;
  onAdicionarDocumento: () => void;
  onAdicionarFuncionario: () => void;
  onRemover: (item: ItemRascunho) => void;
};

export function BlocoItensLista({ dados, erro, onAdicionarDocumento, onAdicionarFuncionario, onRemover }: Props) {
  return (
    <Card as="section">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Heading>{t.title}</Heading>
          <Text size="support" tone="muted" className="mt-1">
            {t.description}
          </Text>
        </div>
        <Inline className="lg:flex-none">
          <Button icon={PlusIcon} onClick={onAdicionarDocumento}>
            {l.adicionarDocumento}
          </Button>
          <Button icon={PlusIcon} onClick={onAdicionarFuncionario}>
            {l.adicionarFuncionario}
          </Button>
        </Inline>
      </div>
      <div className="mt-3">
        {dados.itens.length === 0 ? (
          erro ? (
            <AlertBox variant="error">{erro}</AlertBox>
          ) : (
            <Text size="support" tone="muted">
              {t.vazio}
            </Text>
          )
        ) : (
          <ItensTabela itens={dados.itens} rowClick={false} action={{ label: () => t.remover, describe: (i) => i.nome, onClick: onRemover }} />
        )}
      </div>
    </Card>
  );
}
