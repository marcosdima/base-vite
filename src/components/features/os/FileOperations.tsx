import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  changeOwner,
  changePermissions,
  createDirectory,
  createFile,
  createHardLink,
  createSymlink,
} from '../../../features/os/osSlice';
import {
  ActionButton,
  Actions,
  Field,
  FieldRow,
  Input,
  PanelBody,
} from '../../../styles/components/osExplorer.styles';

export function FileOperations() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [directoryName, setDirectoryName] = useState('');
  const [fileName, setFileName] = useState('');
  const [symlinkName, setSymlinkName] = useState('');
  const [symlinkTarget, setSymlinkTarget] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkSource, setLinkSource] = useState('');
  const [chmodPath, setChmodPath] = useState('');
  const [chmodMode, setChmodMode] = useState('644');
  const [chownPath, setChownPath] = useState('');
  const [chownUid, setChownUid] = useState('0');
  const [chownGid, setChownGid] = useState('0');

  return (
    <PanelBody>
      <FieldRow>
        <Field>
          {t('os.formDirectoryName')}
          <Input
            type="text"
            value={directoryName}
            placeholder="projects"
            onChange={(event) => setDirectoryName(event.target.value)}
          />
        </Field>

        <Field>
          {t('os.formFileName')}
          <Input
            type="text"
            value={fileName}
            placeholder="notes.md"
            onChange={(event) => setFileName(event.target.value)}
          />
        </Field>
      </FieldRow>

      <Actions>
        <ActionButton
          type="button"
          disabled={!directoryName.trim()}
          onClick={() => {
            dispatch(createDirectory({ path: directoryName.trim() }));
            setDirectoryName('');
          }}
        >
          {t('os.actionMkdir')}
        </ActionButton>

        <ActionButton
          type="button"
          disabled={!fileName.trim()}
          onClick={() => {
            dispatch(createFile({ path: fileName.trim() }));
            setFileName('');
          }}
        >
          {t('os.actionTouch')}
        </ActionButton>
      </Actions>

      <FieldRow>
        <Field>
          {t('os.formSymlinkName')}
          <Input
            type="text"
            value={symlinkName}
            placeholder="current"
            onChange={(event) => setSymlinkName(event.target.value)}
          />
        </Field>

        <Field>
          {t('os.formSymlinkTarget')}
          <Input
            type="text"
            value={symlinkTarget}
            placeholder="/home/dev/projects"
            onChange={(event) => setSymlinkTarget(event.target.value)}
          />
        </Field>
      </FieldRow>

      <Actions>
        <ActionButton
          type="button"
          disabled={!symlinkName.trim() || !symlinkTarget.trim()}
          onClick={() => {
            dispatch(createSymlink({ path: symlinkName.trim(), target: symlinkTarget.trim() }));
            setSymlinkName('');
            setSymlinkTarget('');
          }}
        >
          {t('os.actionSymlink')}
        </ActionButton>
      </Actions>

      <FieldRow>
        <Field>
          {t('os.formLinkName')}
          <Input
            type="text"
            value={linkName}
            placeholder="run-alias.sh"
            onChange={(event) => setLinkName(event.target.value)}
          />
        </Field>

        <Field>
          {t('os.formLinkSource')}
          <Input
            type="text"
            value={linkSource}
            placeholder="/home/dev/run.sh"
            onChange={(event) => setLinkSource(event.target.value)}
          />
        </Field>
      </FieldRow>

      <Actions>
        <ActionButton
          type="button"
          disabled={!linkName.trim() || !linkSource.trim()}
          onClick={() => {
            dispatch(createHardLink({ path: linkName.trim(), existingPath: linkSource.trim() }));
            setLinkName('');
            setLinkSource('');
          }}
        >
          {t('os.actionLink')}
        </ActionButton>
      </Actions>

      <FieldRow>
        <Field>
          {t('os.formChmodPath')}
          <Input
            type="text"
            value={chmodPath}
            placeholder="/home/dev/notes.md"
            onChange={(event) => setChmodPath(event.target.value)}
          />
        </Field>

        <Field>
          {t('os.formChmodMode')}
          <Input
            type="text"
            value={chmodMode}
            onChange={(event) => setChmodMode(event.target.value)}
          />
        </Field>
      </FieldRow>

      <Actions>
        <ActionButton
          type="button"
          disabled={!chmodPath.trim() || !chmodMode.trim()}
          onClick={() => {
            const permissions = Number.parseInt(chmodMode.trim(), 8);

            if (Number.isNaN(permissions)) {
              return;
            }

            dispatch(changePermissions({ path: chmodPath.trim(), permissions }));
          }}
        >
          {t('os.actionChmod')}
        </ActionButton>
      </Actions>

      <FieldRow>
        <Field>
          {t('os.formChownPath')}
          <Input
            type="text"
            value={chownPath}
            placeholder="/home/dev/notes.md"
            onChange={(event) => setChownPath(event.target.value)}
          />
        </Field>

        <Field>
          {t('os.formUid')}
          <Input
            type="text"
            value={chownUid}
            onChange={(event) => setChownUid(event.target.value)}
          />
        </Field>

        <Field>
          {t('os.formGid')}
          <Input
            type="text"
            value={chownGid}
            onChange={(event) => setChownGid(event.target.value)}
          />
        </Field>
      </FieldRow>

      <Actions>
        <ActionButton
          type="button"
          disabled={!chownPath.trim()}
          onClick={() => {
            const uid = Number.parseInt(chownUid.trim(), 10);
            const gid = Number.parseInt(chownGid.trim(), 10);

            if (Number.isNaN(uid) || Number.isNaN(gid)) {
              return;
            }

            dispatch(changeOwner({ path: chownPath.trim(), uid, gid }));
          }}
        >
          {t('os.actionChown')}
        </ActionButton>
      </Actions>
    </PanelBody>
  );
}
