import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { writeFile } from '../../../features/os/osSlice';
import type { RootState } from '../../../app/store';
import { selectFileContent } from '../../../features/os/osSlice';
import {
  ActionButton,
  Actions,
  ContentPreview,
  Field,
  FieldRow,
  Input,
  PanelBody,
  Textarea,
} from '../../../styles/components/osExplorer.styles';

interface FileViewerProps {
  path: string;
  isRegularFile: boolean;
}

export function FileViewer({ path, isRegularFile }: FileViewerProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const storedContent = useSelector((state: RootState) => selectFileContent(state, path));
  const [draft, setDraft] = useState(storedContent ?? '');
  const [draftPath, setDraftPath] = useState(path);

  // Si cambia el archivo seleccionado, el borrador se reinicia con su contenido.
  if (draftPath !== path) {
    setDraftPath(path);
    setDraft(storedContent ?? '');
  }

  if (!isRegularFile) {
    return null;
  }

  return (
    <PanelBody>
      <Field>
        {t('os.viewerTitle')}
        <Input type="text" value={path} readOnly aria-label={t('os.fieldPath')} />
      </Field>

      <ContentPreview>{storedContent ?? ''}</ContentPreview>

      <FieldRow>
        <Field>
          {t('os.viewerContent')}
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={t('os.viewerContent')}
            spellCheck={false}
          />
        </Field>
      </FieldRow>

      <Actions>
        <ActionButton type="button" onClick={() => dispatch(writeFile({ path, content: draft }))}>
          {t('os.actionSave')}
        </ActionButton>
      </Actions>
    </PanelBody>
  );
}
