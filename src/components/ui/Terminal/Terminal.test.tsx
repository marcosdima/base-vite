import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/render';
import { Terminal } from './Terminal';

describe('Terminal component', () => {
  it('renders title and welcome message', () => {
    render(<Terminal title="My Shell" welcomeMessage="Hello Tester" />);
    expect(screen.getByText('My Shell')).toBeInTheDocument();
    expect(screen.getByText('Hello Tester')).toBeInTheDocument();
  });

  it('handles echo command', () => {
    render(<Terminal prompt="test$ " />);
    const input = screen.getByLabelText('Terminal input');

    fireEvent.change(input, { target: { value: 'echo hello world' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('test$ echo hello world')).toBeInTheDocument();
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('handles clear command', () => {
    render(<Terminal welcomeMessage="Will be cleared" />);
    expect(screen.getByText('Will be cleared')).toBeInTheDocument();

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.queryByText('Will be cleared')).not.toBeInTheDocument();
  });

  it('runs custom registered commands', async () => {
    const customHandler = vi.fn((_args, context) => {
      context.print('custom result', 'success');
    });

    render(
      <Terminal
        commands={{
          ping: {
            description: 'Ping command',
            handler: customHandler,
          },
        }}
      />,
    );

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'ping host1' } });
    fireEvent.submit(input.closest('form')!);

    expect(customHandler).toHaveBeenCalled();
    expect(screen.getByText('custom result')).toBeInTheDocument();
  });

  it('handles unknown command by displaying error message', () => {
    render(<Terminal />);
    const input = screen.getByLabelText('Terminal input');

    fireEvent.change(input, { target: { value: 'invalidcmd' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/command not found: invalidcmd/)).toBeInTheDocument();
  });

  it('cycles through history with ArrowUp and ArrowDown', () => {
    render(<Terminal />);
    const input = screen.getByLabelText('Terminal input') as HTMLInputElement;

    // Run first command
    fireEvent.change(input, { target: { value: 'cmd1' } });
    fireEvent.submit(input.closest('form')!);

    // Run second command
    fireEvent.change(input, { target: { value: 'cmd2' } });
    fireEvent.submit(input.closest('form')!);

    expect(input.value).toBe('');

    // Press ArrowUp -> cmd2
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('cmd2');

    // Press ArrowUp -> cmd1
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('cmd1');

    // Press ArrowDown -> cmd2
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('cmd2');

    // Press ArrowDown -> empty
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('');
  });
});
