import { describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor, within, createOsStore } from '../test/render';
import i18n from '../i18n';
import { OsExplorerPage } from './OsExplorerPage';

function renderPage() {
  const store = createOsStore();

  const utils = render(
    <Provider store={store}>
      <OsExplorerPage />
    </Provider>,
  );

  return { store, ...utils };
}

/** Busca un nombre de entrada dentro de la tabla de entradas, no en el árbol. */
function findEntryRow(name: string): HTMLElement {
  const rows = screen.getAllByRole('row');
  const row = rows.find((candidate) => within(candidate).queryByText(name));

  if (!row) {
    throw new Error(`No se encontró la fila con la entrada "${name}"`);
  }

  return row;
}

describe('OsExplorerPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('should render the explorer with the current directory entries', () => {
    renderPage();

    expect(findEntryRow('notes.md')).toBeInTheDocument();
    expect(findEntryRow('projects')).toBeInTheDocument();
  });

  it('should navigate into a directory when its row is opened', async () => {
    const { store } = renderPage();

    fireEvent.doubleClick(findEntryRow('projects'));

    await waitFor(() => {
      expect(store.getState().os.currentPath).toBe('/home/dev/projects');
    });

    expect(findEntryRow('app.log')).toBeInTheDocument();
  });

  it('should show the inode details of the selected entry', async () => {
    const { store } = renderPage();

    fireEvent.click(findEntryRow('notes.md'));

    await waitFor(() => {
      expect(store.getState().os.selectedInode).not.toBeNull();
    });

    expect(screen.getAllByText('Inode').length).toBeGreaterThan(0);
  });

  it('should create a file from the operations tab', async () => {
    const { store } = renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Operations' }));

    const input = screen.getByPlaceholderText('notes.md');
    fireEvent.change(input, { target: { value: 'created.txt' } });
    fireEvent.click(screen.getByRole('button', { name: 'touch' }));

    await waitFor(() => {
      expect(store.getState().os.status?.message).toContain('created.txt');
    });
  });

  it('should create a symbolic link from the terminal', async () => {
    const { store } = renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Terminal' }));

    const input = screen.getByLabelText('Terminal command');
    fireEvent.change(input, { target: { value: 'ln -s /etc link-to-etc' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(store.getState().os.status?.message).toContain('link-to-etc');
    });

    expect(store.getState().os.fs.links).toBeDefined();
  });
});
