import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeOwner,
  changePermissions,
  createDirectory,
  createFile,
  createHardLink,
  createSymlink,
  goToPath,
  removePath,
  selectCurrentEntries,
  selectCurrentPath,
  selectFilesystemStats,
  selectOsStatus,
} from '../../../features/os/osSlice';
import { basename } from '../../../features/os/filesystem';
import { parseCommand } from '../../../features/os/terminal';
import type { RootState } from '../../../app/store';
import {
  Terminal,
  TerminalForm,
  TerminalInput,
  TerminalLine,
  TerminalOutput,
  TerminalPrompt,
} from '../../../styles/components/osExplorer.styles';

interface TerminalLineEntry {
  id: number;
  text: string;
  type?: 'error' | 'success' | 'muted';
}

export function OsTerminal() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentPath = useSelector((state: RootState) => selectCurrentPath(state));
  const entries = useSelector((state: RootState) => selectCurrentEntries(state));
  const stats = useSelector((state: RootState) => selectFilesystemStats(state));
  const status = useSelector((state: RootState) => selectOsStatus(state));

  const [command, setCommand] = useState('');
  const [lines, setLines] = useState<TerminalLineEntry[]>([
    { id: 0, text: t('os.terminalWelcome'), type: 'muted' },
  ]);

  const append = (text: string, type?: TerminalLineEntry['type']) => {
    setLines((previous) => [...previous, { id: previous.length, text, type }]);
  };

  const runCommand = (rawCommand: string) => {
    const command = parseCommand(rawCommand);

    switch (command.name) {
      case 'pwd':
        append(currentPath);
        break;

      case 'ls':
        if (entries.length === 0) {
          append(t('os.emptyDirectory'), 'muted');
        } else {
          entries.forEach((entry) => append(`${entry.symbolicMode} ${entry.name}`));
        }
        break;

      case 'cd':
        dispatch(goToPath(command.path));
        break;

      case 'mkdir':
        dispatch(createDirectory({ path: command.path }));
        break;

      case 'touch':
        dispatch(createFile({ path: command.path }));
        break;

      case 'ln':
        if (command.symbolic) {
          dispatch(createSymlink({ path: command.linkPath, target: command.source }));
        } else {
          dispatch(createHardLink({ path: command.linkPath, existingPath: command.source }));
        }
        break;

      case 'rm':
        dispatch(removePath(command.path));
        break;

      case 'chmod':
        dispatch(
          changePermissions({
            path: command.path,
            permissions: command.permissions,
          }),
        );
        break;

      case 'chown':
        dispatch(
          changeOwner({
            path: command.path,
            uid: command.uid,
            gid: command.gid,
          }),
        );
        break;

      case 'df':
        append(
          `${t('os.terminalInodes')}: ${stats.usedInodes}/${stats.inodes} · ${t('os.terminalBlocks')}: ${stats.usedBlocks}/${stats.blocks}`,
        );
        break;

      case 'help':
        append(t('os.terminalHelp'));
        break;

      case 'clear':
        setLines([]);
        break;

      case 'unknown':
        if (command.command) {
          append(t('os.terminalUnknown', { command: command.command }), 'error');
        }
        break;
    }
  };

  return (
    <Terminal
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <TerminalOutput aria-live="polite">
        {lines.map((line) => (
          <TerminalLine key={line.id} $type={line.type}>
            {line.text}
          </TerminalLine>
        ))}
      </TerminalOutput>

      <TerminalForm
        onSubmit={(event) => {
          event.preventDefault();
          append(`${currentPath} $ ${command}`, 'muted');
          runCommand(command);
          setCommand('');
        }}
      >
        <TerminalPrompt>{basename(currentPath)} $</TerminalPrompt>
        <TerminalInput
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          aria-label={t('os.terminalInputLabel')}
          placeholder={t('os.terminalPlaceholder')}
          spellCheck={false}
        />
      </TerminalForm>

      {status ? (
        <TerminalLine $type={status.type === 'error' ? 'error' : 'success'}>
          {status.message}
        </TerminalLine>
      ) : null}
    </Terminal>
  );
}
