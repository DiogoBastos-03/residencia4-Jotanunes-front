import { useState } from 'react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { AlertBox, Block, Button, Drawer, InfoNote, Inline, KeyValueList, Modal, Stack, useToast } from '@/shared/ui';

const t = strings.pages.componentes.overlays;

export function OverlaysSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <Block title={strings.pages.componentes.sections.overlays} padded>
      <Inline>
        <Button onClick={() => setDrawerOpen(true)}>{t.openDrawer}</Button>
        <Button onClick={() => setModalOpen(true)}>{t.openModal}</Button>
        <Button onClick={() => showToast(t.toastSuccess)}>{t.showToast}</Button>
        <Button onClick={() => showToast(t.toastError, 'error')}>{t.showErrorToast}</Button>
      </Inline>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t.drawerTitle}
        subtitle={t.drawerSubtitle}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDrawerOpen(false)}>
              {t.drawerCancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setDrawerOpen(false);
                showToast(t.toastDone);
              }}
            >
              {t.drawerConfirm}
            </Button>
          </>
        }
      >
        <Stack>
          <KeyValueList layout="stacked" items={t.drawerItems} />
          <InfoNote>{t.drawerNote}</InfoNote>
        </Stack>
      </Drawer>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t.modalTitle}
        description={t.modalDescription}
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>{t.modalCancel}</Button>
            <Button
              variant="primary"
              icon={NoSymbolIcon}
              onClick={() => {
                setModalOpen(false);
                showToast(t.toastBlocked);
              }}
            >
              {t.modalConfirm}
            </Button>
          </>
        }
      >
        <AlertBox variant="error">{t.modalAlert}</AlertBox>
      </Modal>
    </Block>
  );
}
