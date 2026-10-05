import { useState } from 'react';
import { strings } from '@/shared/strings';
import { Block, FilterBar, Inline, SearchInput, Select, Stack, Tabs, Text } from '@/shared/ui';

const t = strings.pages.componentes.filters;

type FilterValue = (typeof t.options)[number]['value'];
type TabValue = (typeof t.tabs)[number]['value'];

export function FiltersSection() {
  const [filter, setFilter] = useState<FilterValue>('todos');
  const [type, setType] = useState<string>(t.selectSm[0].value);
  const [tab, setTab] = useState<TabValue>('docs');
  const [query, setQuery] = useState('');

  return (
    <Block title={strings.pages.componentes.sections.filters} padded>
      <Stack>
        <SearchInput
          label={t.searchLabel}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          wrapperClassName="max-w-80"
        />
        <Inline>
          <FilterBar label={t.groupLabel} options={t.options} value={filter} onChange={setFilter} />
          <Select
            aria-label={t.selectSmLabel}
            size="sm"
            options={t.selectSm}
            value={type}
            onChange={(e) => setType(e.target.value)}
            wrapperClassName="w-44"
          />
        </Inline>
        <Tabs label={t.tabsLabel} items={t.tabs} value={tab} onChange={setTab}>
          <Text tone="muted" size="support" className="mt-3">
            {t.tabContent[tab]}
          </Text>
        </Tabs>
      </Stack>
    </Block>
  );
}
