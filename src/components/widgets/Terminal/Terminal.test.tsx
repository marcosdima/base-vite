import { describe, it, expect, vi } from 'vitest';
import { Terminal } from './Terminal';
import { fireEvent, render, screen } from '@/test/render';

describe('Terminal component', () => {
  it('renders title and welcome message', () => {
    render(<Terminal title="My Shell" welcomeMessage="Hello Tester" />);
    expect(screen.getByText('My Shell')).toBeInTheDocument();
    expect(screen.getByText('Hello Tester')).toBeInTheDocument();
  });

  it('displays custom prompt', () => {
    render(<Terminal prompt="test$ " />);
    const input = screen.getByLabelText('Terminal input');
    expect(input).toBeInTheDocument();
    expect(screen.getByText('test$')).toBeInTheDocument();
  });

  it('executes built-in commands like echo and clear', () => {
    render(<Terminal welcomeMessage="Will be cleared" />);
    expect(screen.getByText('Will be cleared')).toBeInTheDocument();

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'echo hello world' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('hello world')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.queryByText('Will be cleared')).not.toBeInTheDocument();
    expect(screen.queryByText('hello world')).not.toBeInTheDocument();
  });

  it('executes custom defined commands', () => {
    const customHandler = vi.fn((args, { print }) => {
      print(`Custom executed with: ${args.join(',')}`);
    });

    render(
      <Terminal
        commands={{
          deploy: {
            description: 'Deploy app',
            handler: customHandler,
          },
        }}
      />,
    );

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'deploy prod --force' } });
    fireEvent.submit(input.closest('form')!);

    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Custom executed with: prod,--force')).toBeInTheDocument();
  });

  it('handles unknown commands via fallback message', () => {
    render(<Terminal />);
    const input = screen.getByLabelText('Terminal input');

    fireEvent.change(input, { target: { value: 'foobar' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/command not found: foobar/i)).toBeInTheDocument();
  });

  it('navigates command history with ArrowUp and ArrowDown', () => {
    render(<Terminal />);
    const input = screen.getByLabelText('Terminal input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'echo first' } });
    fireEvent.submit(input.closest('form')!);

    fireEvent.change(input, { target: { value: 'echo second' } });
    fireEvent.submit(input.closest('form')!);

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('echo second');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('echo first');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('echo second');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('');
  });
});
