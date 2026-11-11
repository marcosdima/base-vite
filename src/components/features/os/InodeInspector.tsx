import { useTranslation } from 'react-i18next';
import { formatModeOctal, formatModeSymbolic } from '../../../features/os/fileMode';
import type { Inode } from '../../../features/os/inode';
import { Inspector, Mono } from '../../../styles/components/osExplorer.styles';

interface InodeInspectorProps {
  inode: Inode | null;
  path: string;
  linkTarget?: string | null;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19);
}

export function InodeInspector({ inode, path, linkTarget }: InodeInspectorProps) {
  const { t } = useTranslation();

  if (!inode) {
    return <Mono>{t('os.noSelection')}</Mono>;
  }

  return (
    <Inspector>
      <dt>{t('os.fieldPath')}</dt>
      <dd>{path}</dd>

      <dt>{t('os.fieldInode')}</dt>
      <dd>{inode.number}</dd>

      <dt>{t('os.fieldMode')}</dt>
      <dd>
        {formatModeOctal(inode.mode)} ({formatModeSymbolic(inode.mode)})
      </dd>

      <dt>{t('os.fieldOwner')}</dt>
      <dd>
        {inode.uid}:{inode.gid}
      </dd>

      <dt>{t('os.fieldLinks')}</dt>
      <dd>{inode.nlink}</dd>

      <dt>{t('os.fieldSize')}</dt>
      <dd>{inode.size} bytes</dd>

      <dt>{t('os.fieldBlocks')}</dt>
      <dd>{inode.blocks}</dd>

      <dt>{t('os.fieldAtime')}</dt>
      <dd>{formatTimestamp(inode.atime)}</dd>

      <dt>{t('os.fieldMtime')}</dt>
      <dd>{formatTimestamp(inode.mtime)}</dd>

      <dt>{t('os.fieldCtime')}</dt>
      <dd>{formatTimestamp(inode.ctime)}</dd>

      {linkTarget ? (
        <>
          <dt>{t('os.fieldLinkTarget')}</dt>
          <dd>{linkTarget}</dd>
        </>
      ) : null}
    </Inspector>
  );
}
