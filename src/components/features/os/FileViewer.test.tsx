import { describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, createOsStore } from '../../../test/render';
import i18n from '../../../i18n';
import { FileViewer } from './FileViewer';

function renderViewer(path = '/home/dev/notes.md', isRegularFile = true) {
  const store = createOsStore();

  const utils = render(
    <Provider store={store}>
      <FileViewer path={path} isRegularFile={isRegularFile} />
    </Provider>,
  );

  return { store, ...utils };
}

describe('FileViewer', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('should render nothing when the path is not a regular file', () => {
    const { container } = renderViewer('/home/dev/projects', false);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show the current content of the file', () => {
    const { container } = renderViewer();

    expect(container.querySelector('pre')).toHaveTextContent('# Notas');
    expect(screen.getByLabelText('Content')).toHaveValue('# Notas\n\nApuntes del proyecto.\n');
  });

  it('should save the edited content back to the filesystem', () => {
    const { store } = renderViewer();

    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'contenido nuevo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(store.getState().os.status?.message).toContain('/home/dev/notes.md');
    expect(Object.values(store.getState().os.fs.blobs)).toContain('contenido nuevo');
  });

  it('should reset the draft when a different file is selected', () => {
    const { store, rerender } = renderViewer('/home/dev/notes.md');

    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'borrador' } });

    rerender(
      <Provider store={store}>
        <FileViewer path="/home/dev/.bashrc" isRegularFile />
      </Provider>,
    );

    expect(screen.getByLabelText('Content')).toHaveValue('export PS1="dev@host:~$"\n');
  });
});
