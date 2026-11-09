import { EnvelopeIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Contato } from '@/entities';
import { formatDate, formatPhone } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, Card, Grid, Heading, Inline, KeyValueList, Text } from '@/shared/ui';
import type { FichaFornecedor } from '../types';

const t = strings.pages.fornecedor.contatos;

type Props = {
  ficha: FichaFornecedor;
  onReenviar: () => void;
  /** Abre a edição (ou a criação) do contato daquele papel. */
  onEditar: (papel: Contato['papel']) => void;
};

export function AbaContatos({ ficha, onReenviar, onEditar }: Props) {
  const acesso = ficha.fornecedor.acessoPortal;
  const semSeguranca = !ficha.fornecedor.contatos.some((c) => c.papel === 'seguranca');
  return (
    <Grid>
      {ficha.fornecedor.contatos.map((c) => {
        const titulo = c.papel === 'principal' ? t.principal : t.seguranca;
        return (
          <Card key={c.papel}>
            <Inline justify="between">
              <Heading>{titulo}</Heading>
              <Button variant="tertiary" size="sm" icon={PencilSquareIcon} aria-label={t.editarDescricao(titulo)} onClick={() => onEditar(c.papel)}>
                {t.editar}
              </Button>
            </Inline>
            <KeyValueList
              className="mt-3"
              items={[
                { key: 'nome', label: t.nome, value: c.nome },
                ...(c.cargo ? [{ key: 'cargo', label: t.cargo, value: c.cargo }] : []),
                { key: 'email', label: t.email, value: c.email },
                ...(c.telefone ? [{ key: 'tel', label: t.telefone, value: formatPhone(c.telefone) }] : []),
              ]}
            />
          </Card>
        );
      })}
      <Card>
        <Inline justify="between">
          <Heading>{t.acesso}</Heading>
          {ficha.aguardandoAcesso && <Badge status="aguardandoAcesso" />}
        </Inline>
        <KeyValueList className="mt-3" items={[{ key: 'email', label: t.emailConvite, value: acesso.emailConvite }]} />
        <Text size="support" tone="muted" className="mt-3">
          {acesso.acessouEm
            ? t.acessou(formatDate(acesso.acessouEm, 'date'))
            : acesso.convidadoEm
              ? t.aguardando(formatDate(acesso.convidadoEm, 'date'))
              : t.semConvite}
        </Text>
        {ficha.aguardandoAcesso && (
          <div className="mt-auto pt-3">
            <Button icon={EnvelopeIcon} onClick={onReenviar}>
              {acesso.convidadoEm ? strings.pages.fornecedor.reenviar : t.enviarConvite}
            </Button>
          </div>
        )}
      </Card>
      {semSeguranca && (
        <Card muted>
          <Heading>{t.seguranca}</Heading>
          <Text size="support" tone="muted" className="mt-2">
            {t.semSeguranca}
          </Text>
          <div className="mt-auto pt-3">
            <Button icon={PlusIcon} onClick={() => onEditar('seguranca')}>
              {t.adicionarSeguranca}
            </Button>
          </div>
        </Card>
      )}
    </Grid>
  );
}
