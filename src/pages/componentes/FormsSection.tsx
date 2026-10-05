import { useState } from 'react';
import { formatCnpj } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Block, Checkbox, Field, Grid, Input, Select, Stack, Textarea } from '@/shared/ui';

const t = strings.pages.componentes.forms;

export function FormsSection() {
  const [validity, setValidity] = useState('');
  const [cnpj, setCnpj] = useState<string>(t.cnpjValue);
  const [reason, setReason] = useState<string>(t.reasons[0].value);
  const [checked, setChecked] = useState(true);
  const [unchecked, setUnchecked] = useState(false);

  return (
    <Block title={strings.pages.componentes.sections.forms} padded>
      <Stack>
        <Grid>
          <Field label={t.validity} hint={t.validityHint}>
            {(control) => (
              <Input
                {...control}
                placeholder={t.validityPlaceholder}
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
              />
            )}
          </Field>
          <Field label={t.cnpj} error={t.cnpjError}>
            {(control) => (
              <Input {...control} mono value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))} />
            )}
          </Field>
          <Field label={t.reason}>
            {(control) => (
              <Select {...control} options={t.reasons} value={reason} onChange={(e) => setReason(e.target.value)} />
            )}
          </Field>
          <Field label={t.disabled}>
            {(control) => <Input {...control} mono value={t.disabledValue} disabled readOnly />}
          </Field>
        </Grid>
        <Field label={t.note} hint={t.noteHint}>
          {(control) => <Textarea {...control} rows={4} placeholder={t.notePlaceholder} />}
        </Field>
        <Grid>
          <Checkbox label={t.checkboxes.checked} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <Checkbox
            label={t.checkboxes.unchecked}
            checked={unchecked}
            onChange={(e) => setUnchecked(e.target.checked)}
          />
          <Checkbox label={t.checkboxes.locked} description={t.checkboxes.lockedHint} locked />
          <Checkbox label={t.checkboxes.disabled} description={t.checkboxes.disabledHint} disabled />
        </Grid>
      </Stack>
    </Block>
  );
}
