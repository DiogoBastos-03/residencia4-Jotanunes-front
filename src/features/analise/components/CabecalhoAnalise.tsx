import type { ReactNode } from 'react';
import { paths, type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { PageHeader } from '@/shared/ui';
import type { Sequencia } from '../types';
import { NavegacaoAnalise } from './NavegacaoAnalise';

type Props = {
  origem: Origem;
  sequencia: Sequencia;
  title: string;
  badges?: ReactNode;
  subtitle?: ReactNode;
};

/** A migalha mostra e devolve para a origem de verdade, na aba em que estava. */
export function CabecalhoAnalise({ origem, sequencia, title, badges, subtitle }: Props) {
  const rotulo = origem.tipo === 'fila' ? strings.pages.analise.navegacao.origemFila : (sequencia.origemNome ?? strings.pages.analise.navegacao.origemFila);
  return (
    <PageHeader
      level="subpage"
      back={{ to: paths.origem(origem), label: rotulo }}
      title={title}
      badges={badges}
      subtitle={subtitle}
      actions={<NavegacaoAnalise sequencia={sequencia} origem={origem} />}
    />
  );
}
