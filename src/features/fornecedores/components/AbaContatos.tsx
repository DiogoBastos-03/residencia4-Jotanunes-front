import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, Card, Grid, Heading, Inline, KeyValueList, Text } from '@/shared/ui';
import type { FichaFornecedor } from '../types';

const t = strings.pages.fornecedor.contatos;

export function AbaContatos({ ficha, onReenviar }: { ficha: FichaFornecedor; onReenviar: () => void }) {
  const acesso = ficha.fornecedor.acessoPortal;
  return (
    <Grid>
      {ficha.fornecedor.contatos.map((c) => (
        <Card key={c.papel}>
          <Heading>{c.papel === 'principal' ? t.principal : t.seguranca}</Heading>
          <KeyValueList
            className="mt-3"
            items={[
              { key: 'nome', label: t.nome, value: c.nome },
              ...(c.cargo ? [{ key: 'cargo', label: t.cargo, value: c.cargo }] : []),
              { key: 'email', label: t.email, value: c.email },
              ...(c.telefone ? [{ key: 'tel', label: t.telefone, value: c.telefone }] : []),
            ]}
          />
        </Card>
      ))}
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
              {strings.pages.fornecedor.reenviar}
            </Button>
          </div>
        )}
      </Card>
    </Grid>
  );
}
