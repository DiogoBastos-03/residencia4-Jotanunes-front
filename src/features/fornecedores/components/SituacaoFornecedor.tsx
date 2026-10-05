import { Badge, Inline } from '@/shared/ui';
import type { SituacaoFornecedor as Situacao } from '@/entities';

/** Situação + "Aguardando 1º acesso" quando o fornecedor ainda não entrou no portal. */
export function SituacaoFornecedor({ situacao, aguardandoAcesso }: { situacao: Situacao; aguardandoAcesso: boolean }) {
  return (
    <Inline gap="xs">
      <Badge status={situacao} />
      {aguardandoAcesso && <Badge status="aguardandoAcesso" />}
    </Inline>
  );
}
