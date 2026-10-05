import { EnvelopeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, Card, EmptyState, Grid, Heading, InfoNote, Inline, KeyValueList, Stack, Text } from '@/shared/ui';
import type { FichaFornecedor } from '../types';

const t = strings.pages.fornecedor.contatos;

/** Acesso ao portal: com a API não existe (não há endpoint de convite) — a ação fica indisponível, com o motivo. */
function CartaoAcesso({ ficha, onReenviar }: { ficha: FichaFornecedor; onReenviar: () => void }) {
  const acesso = ficha.fornecedor.acessoPortal;
  return (
    <Card>
      <Inline justify="between">
        <Heading>{t.acesso}</Heading>
        {ficha.aguardandoAcesso && <Badge status="aguardandoAcesso" />}
      </Inline>
      {acesso ? (
        <>
          <KeyValueList className="mt-3" items={[{ key: 'email', label: t.emailConvite, value: acesso.emailConvite }]} />
          <Text size="support" tone="muted" className="mt-3">
            {acesso.acessouEm
              ? t.acessou(formatDate(acesso.acessouEm, 'date'))
              : acesso.convidadoEm
                ? t.aguardando(formatDate(acesso.convidadoEm, 'date'))
                : t.semConvite}
          </Text>
        </>
      ) : (
        <InfoNote className="mt-3">{t.acessoIndisponivel}</InfoNote>
      )}
      {(ficha.aguardandoAcesso || !acesso) && (
        <div className="mt-auto pt-3">
          <Button icon={EnvelopeIcon} disabled={!acesso} onClick={onReenviar}>
            {strings.pages.fornecedor.reenviar}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function AbaContatos({ ficha, onReenviar }: { ficha: FichaFornecedor; onReenviar: () => void }) {
  const contatos = ficha.fornecedor.contatos;
  if (contatos.length === 0) {
    return (
      <Stack>
        <EmptyState icon={UserGroupIcon} title={t.vazioTitle} description={t.vazioDescription} />
        <Grid>
          <CartaoAcesso ficha={ficha} onReenviar={onReenviar} />
        </Grid>
      </Stack>
    );
  }
  return (
    <Grid>
      {contatos.map((c) => (
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
      <CartaoAcesso ficha={ficha} onReenviar={onReenviar} />
    </Grid>
  );
}
