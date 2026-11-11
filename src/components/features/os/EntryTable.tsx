import { FiFile, FiFolder, FiLink } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { OsEntry } from '../../../features/os/osSlice';
import { Mono, NameCell, Table, TableRow } from '../../../styles/components/osExplorer.styles';

interface EntryTableProps {
  entries: OsEntry[];
  selectedInode: number | null;
  onSelect: (entry: OsEntry) => void;
  onOpen: (entry: OsEntry) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19);
}

export function EntryTable({ entries, selectedInode, onSelect, onOpen }: EntryTableProps) {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return <Mono>{t('os.emptyDirectory')}</Mono>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th scope="col">{t('os.columnName')}</th>
          <th scope="col">{t('os.columnMode')}</th>
          <th scope="col">{t('os.columnOwner')}</th>
          <th scope="col">{t('os.columnSize')}</th>
          <th scope="col">{t('os.columnLinks')}</th>
          <th scope="col">{t('os.columnInode')}</th>
          <th scope="col">{t('os.columnModified')}</th>
        </tr>
      </thead>

      <tbody>
        {entries.map((entry) => (
          <TableRow
            key={entry.path}
            $selected={entry.inodeNumber === selectedInode}
            onClick={() => onSelect(entry)}
            onDoubleClick={() => onOpen(entry)}
          >
            <td>
              <NameCell>
                {entry.type === 'directory' ? (
                  <FiFolder aria-hidden="true" />
                ) : entry.type === 'symlink' ? (
                  <FiLink aria-hidden="true" />
                ) : (
                  <FiFile aria-hidden="true" />
                )}
                <span>{entry.name}</span>
              </NameCell>
            </td>
            <td>
              <Mono>{entry.symbolicMode}</Mono>
            </td>
            <td>
              <Mono>
                {entry.uid}:{entry.gid}
              </Mono>
            </td>
            <td>
              <Mono>{formatSize(entry.size)}</Mono>
            </td>
            <td>
              <Mono>{entry.nlink}</Mono>
            </td>
            <td>
              <Mono>{entry.inodeNumber}</Mono>
            </td>
            <td>
              <Mono>{formatDate(entry.mtime)}</Mono>
            </td>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
