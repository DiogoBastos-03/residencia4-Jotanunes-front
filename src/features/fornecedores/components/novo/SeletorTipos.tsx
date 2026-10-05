import type { TipoFornecimento } from '@/entities';
import { strings } from '@/shared/strings';
import { Card, ChoiceCard, Heading, Text } from '@/shared/ui';

const t = strings.pages.fornecedorNovo.tipo;

type Props = {
  tipos: readonly TipoFornecimento[];
  onChange: (tipos: TipoFornecimento[]) => void;
  erro?: string;
  /** Sem cartão e sem título — para usar dentro de um modal. */
  semCartao?: boolean;
};

/** Um ou os dois tipos (a empresa pode fornecer material e serviço). */
export function SeletorTipos({ tipos, onChange, erro, semCartao = false }: Props) {
  const alternar = (tipo: TipoFornecimento) => onChange(tipos.includes(tipo) ? tipos.filter((x) => x !== tipo) : [...tipos, tipo]);
  const conteudo = (
    <>
      <div role="group" aria-label={t.title} className="grid items-stretch gap-3 lg:grid-cols-2">
        <ChoiceCard multiple name="tipo-fornecedor" value="servico" checked={tipos.includes('servico')} onChange={() => alternar('servico')} title={t.servico} description={t.servicoDesc} />
        <ChoiceCard multiple name="tipo-fornecedor" value="material" checked={tipos.includes('material')} onChange={() => alternar('material')} title={t.material} description={t.materialDesc} />
      </div>
      {erro ? (
        <Text size="label" className="mt-1.5 text-danger" role="alert">
          {erro}
        </Text>
      ) : (
        <Text size="support" tone="faint" className="mt-2">
          {t.nota}
        </Text>
      )}
    </>
  );
  if (semCartao) return conteudo;
  return (
    <Card as="section">
      <Heading>{t.title}</Heading>
      <div className="mt-3">{conteudo}</div>
    </Card>
  );
}
