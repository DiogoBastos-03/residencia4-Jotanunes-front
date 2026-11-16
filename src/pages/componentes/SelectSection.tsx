import { useState } from 'react';
import { strings } from '@/shared/strings';
import { Block, Field, Grid, Select, Stack, Text } from '@/shared/ui';

const t = strings.pages.componentes.select;
const ESTADOS = t.estados.map((nome) => ({ value: nome, label: nome }));

/** Estados do Select: fechado, aberto, escolhido, inválido, desabilitado, muitas opções (com busca) e sm. */
export function SelectSection() {
  const [fechado, setFechado] = useState('');
  const [aberto, setAberto] = useState('');
  const [escolhido, setEscolhido] = useState('material');
  const [invalido, setInvalido] = useState('');
  const [estado, setEstado] = useState('Pernambuco');
  const [pequeno, setPequeno] = useState('servico');

  return (
    <Block title={strings.pages.componentes.sections.select} padded>
      <Stack>
        <Text size="support" tone="muted">
          {t.nota}
        </Text>
        <Grid>
          <Field label={t.fechado}>{(c) => <Select {...c} options={t.opcoes} value={fechado} onChange={(e) => setFechado(e.target.value)} />}</Field>
          <Field label={t.escolhido}>{(c) => <Select {...c} options={t.opcoes} value={escolhido} onChange={(e) => setEscolhido(e.target.value)} />}</Field>
          <Field label={t.invalido} error={invalido ? undefined : t.invalidoErro}>
            {(c) => <Select {...c} options={t.opcoes} value={invalido} onChange={(e) => setInvalido(e.target.value)} />}
          </Field>
          <Field label={t.desabilitado}>{(c) => <Select {...c} disabled options={t.opcoes} value="servico" onChange={() => undefined} />}</Field>
          <Field label={t.muitas}>{(c) => <Select {...c} options={ESTADOS} value={estado} onChange={(e) => setEstado(e.target.value)} />}</Field>
          <Field label={t.pequeno}>{(c) => <Select {...c} size="sm" options={t.opcoes.slice(1)} value={pequeno} onChange={(e) => setPequeno(e.target.value)} />}</Field>
        </Grid>
        <div className="pb-36">
          <Field label={t.aberto}>
            {(c) => <Select {...c} abertoInicial options={t.opcoes} value={aberto} onChange={(e) => setAberto(e.target.value)} wrapperClassName="w-full max-w-80" />}
          </Field>
        </div>
      </Stack>
    </Block>
  );
}
