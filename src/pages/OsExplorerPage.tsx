import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FiHardDrive } from 'react-icons/fi';
import {
  goToPath,
  removePath,
  selectCurrentEntries,
  selectCurrentPath,
  selectDirectoryTree,
  selectFilesystemStats,
  selectInodeAt,
  selectOsStatus,
  selectSelectedInode,
  selectSymlinkTarget,
  selectEntry,
  type OsEntry,
} from '../features/os/osSlice';
import type { RootState } from '../app/store';
import { DirectoryTree } from '../components/features/os/DirectoryTree';
import { EntryTable } from '../components/features/os/EntryTable';
import { FileOperations } from '../components/features/os/FileOperations';
import { FileViewer } from '../components/features/os/FileViewer';
import { InodeInspector } from '../components/features/os/InodeInspector';
import { OsTerminal } from '../components/features/os/OsTerminal';
import { InodeSimulationView } from '../components/features/simulations/inodes/InodeSimulationView';
import { ProcessSimulationView } from '../components/features/simulations/processes/ProcessSimulationView';
import { getFileType } from '../features/os/fileMode';
import {
  ActionButton,
  Actions,
  Breadcrumb,
  CrumbButton,
  Description,
  Grid,
  Header,
  Meter,
  MeterFill,
  MeterRow,
  MeterTrack,
  Mono,
  Page,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  StatCard,
  StatValue,
  StatusText,
  Tab,
  Tabs,
  Title,
} from '../styles/components/osExplorer.styles';

type OsTab = 'inodes' | 'processes' | 'explorer' | 'operations' | 'terminal';

export function OsExplorerPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [tab, setTab] = useState<OsTab>('explorer');

  const currentPath = useSelector((state: RootState) => selectCurrentPath(state));
  const entries = useSelector((state: RootState) => selectCurrentEntries(state));
  const tree = useSelector((state: RootState) => selectDirectoryTree(state));
  const stats = useSelector((state: RootState) => selectFilesystemStats(state));
  const status = useSelector((state: RootState) => selectOsStatus(state));
  const selectedInode = useSelector((state: RootState) => selectSelectedInode(state));

  const selectedPath = useMemo(
    () => entries.find((entry) => entry.inodeNumber === selectedInode)?.path ?? currentPath,
    [entries, selectedInode, currentPath],
  );

  const selectedInodeData = useSelector((state: RootState) => selectInodeAt(state, selectedPath));
  const symlinkTarget = useSelector((state: RootState) => selectSymlinkTarget(state, selectedPath));

  const crumbs = useMemo(() => {
    const segments = currentPath.split('/').filter(Boolean);
    const paths = segments.map((_, index) => `/${segments.slice(0, index + 1).join('/')}`);

    return ['/', ...paths];
  }, [currentPath]);

  const handleOpen = (entry: OsEntry) => {
    if (entry.type === 'directory') {
      dispatch(goToPath(entry.path));
      return;
    }

    dispatch(selectEntry(entry.inodeNumber));
  };

  return (
    <Page>
      <Header>
        <Title>{t('os.title')}</Title>
        <Description>{t('os.description')}</Description>
      </Header>

      <Tabs role="tablist" aria-label={t('os.tabsLabel')}>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === 'inodes'}
          $active={tab === 'inodes'}
          onClick={() => setTab('inodes')}
        >
          {t('os.tabInodes')}
        </Tab>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === 'processes'}
          $active={tab === 'processes'}
          onClick={() => setTab('processes')}
        >
          {t('os.tabProcesses')}
        </Tab>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === 'explorer'}
          $active={tab === 'explorer'}
          onClick={() => setTab('explorer')}
        >
          {t('os.tabExplorer')}
        </Tab>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === 'operations'}
          $active={tab === 'operations'}
          onClick={() => setTab('operations')}
        >
          {t('os.tabOperations')}
        </Tab>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === 'terminal'}
          $active={tab === 'terminal'}
          onClick={() => setTab('terminal')}
        >
          {t('os.tabTerminal')}
        </Tab>
      </Tabs>

      {tab === 'explorer' ? (
        <>
          <Breadcrumb aria-label={t('os.breadcrumbLabel')}>
            {crumbs.map((crumb, index) => (
              <span key={crumb}>
                {index > 0 ? <Mono> / </Mono> : null}
                <CrumbButton type="button" onClick={() => dispatch(goToPath(crumb))}>
                  {crumb}
                </CrumbButton>
              </span>
            ))}
          </Breadcrumb>

          <Panel>
            <PanelHeader>
              <PanelTitle>
                <FiHardDrive aria-hidden="true" />
                {currentPath}
              </PanelTitle>
              <StatusText $type={status?.type}>{status?.message ?? t('os.statusIdle')}</StatusText>
            </PanelHeader>
            <PanelBody>
              <EntryTable
                entries={entries}
                selectedInode={selectedInode}
                onSelect={(entry) => dispatch(selectEntry(entry.inodeNumber))}
                onOpen={handleOpen}
              />
            </PanelBody>
          </Panel>

          <Grid>
            <Panel>
              <PanelHeader>
                <PanelTitle>{t('os.treeTitle')}</PanelTitle>
              </PanelHeader>
              <PanelBody>
                <DirectoryTree
                  nodes={tree}
                  currentPath={currentPath}
                  onNavigate={(path) => dispatch(goToPath(path))}
                />
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>{t('os.inspectorTitle')}</PanelTitle>
              </PanelHeader>
              <PanelBody>
                <InodeInspector
                  inode={selectedInodeData ?? null}
                  path={selectedPath}
                  linkTarget={symlinkTarget ?? null}
                />
                {selectedInodeData ? (
                  <Actions>
                    <ActionButton type="button" onClick={() => dispatch(removePath(selectedPath))}>
                      {t('os.actionRemove')}
                    </ActionButton>
                  </Actions>
                ) : null}
              </PanelBody>
            </Panel>
          </Grid>

          {selectedInodeData && getFileType(selectedInodeData.mode) === 'regular' ? (
            <Panel>
              <PanelHeader>
                <PanelTitle>{t('os.viewerTitle')}</PanelTitle>
              </PanelHeader>
              <FileViewer path={selectedPath} isRegularFile />
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader>
              <PanelTitle>{t('os.statsTitle')}</PanelTitle>
            </PanelHeader>
            <PanelBody>
              <Grid>
                <StatCard>
                  <StatusText>{t('os.statInodes')}</StatusText>
                  <StatValue>
                    {stats.usedInodes}/{stats.inodes}
                  </StatValue>
                  <Meter>
                    <MeterTrack>
                      <MeterFill $ratio={stats.inodes ? stats.usedInodes / stats.inodes : 0} />
                    </MeterTrack>
                    <MeterRow>
                      <span>{t('os.statUsed')}</span>
                      <span>{stats.freeInodes}</span>
                    </MeterRow>
                  </Meter>
                </StatCard>

                <StatCard>
                  <StatusText>{t('os.statBlocks')}</StatusText>
                  <StatValue>
                    {stats.usedBlocks}/{stats.blocks}
                  </StatValue>
                  <Meter>
                    <MeterTrack>
                      <MeterFill $ratio={stats.blocks ? stats.usedBlocks / stats.blocks : 0} />
                    </MeterTrack>
                    <MeterRow>
                      <span>{t('os.statUsed')}</span>
                      <span>{stats.freeBlocks}</span>
                    </MeterRow>
                  </Meter>
                </StatCard>

                <StatCard>
                  <StatusText>{t('os.statSize')}</StatusText>
                  <StatValue>{stats.totalSize} B</StatValue>
                </StatCard>
              </Grid>
            </PanelBody>
          </Panel>
        </>
      ) : null}

      {tab === 'inodes' ? <InodeSimulationView /> : null}
      {tab === 'processes' ? <ProcessSimulationView /> : null}
      {tab === 'operations' ? (
        <Panel>
          <PanelHeader>
            <PanelTitle>{t('os.operationsTitle')}</PanelTitle>
          </PanelHeader>
          <FileOperations />
        </Panel>
      ) : null}

      {tab === 'terminal' ? <OsTerminal /> : null}
    </Page>
  );
}
