import { FiChevronRight, FiFolder } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { DirNode } from '../../../features/os/filesystem';
import {
  Tree,
  TreeButton,
  TreeChildren,
  TreeItem,
} from '../../../styles/components/osExplorer.styles';

interface DirectoryTreeProps {
  nodes: DirNode[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

function TreeNode({
  node,
  currentPath,
  onNavigate,
}: {
  node: DirNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const isActive = node.path === currentPath;

  return (
    <TreeItem>
      <TreeButton
        type="button"
        $active={isActive}
        onClick={() => onNavigate(node.path)}
        aria-current={isActive ? 'true' : undefined}
      >
        <FiChevronRight size={12} aria-hidden="true" />
        <FiFolder size={14} aria-hidden="true" />
        <span>{node.name}</span>
      </TreeButton>

      {node.children.length > 0 ? (
        <TreeChildren>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </TreeChildren>
      ) : null}
    </TreeItem>
  );
}

export function DirectoryTree({ nodes, currentPath, onNavigate }: DirectoryTreeProps) {
  const { t } = useTranslation();

  if (nodes.length === 0) {
    return <Tree aria-label={t('os.treeLabel')} />;
  }

  return (
    <Tree aria-label={t('os.treeLabel')}>
      {nodes.map((node) => (
        <TreeNode key={node.path} node={node} currentPath={currentPath} onNavigate={onNavigate} />
      ))}
    </Tree>
  );
}
