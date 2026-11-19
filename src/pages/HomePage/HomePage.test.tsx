import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '@/i18n';
import { render, screen } from '@/test/render';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('should render home page with title and description', () => {
    render(<HomePage />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Start building here.')).toBeInTheDocument();
  });

  it('should render the translated content when the language is Spanish', async () => {
    await i18n.changeLanguage('es');

    render(<HomePage />);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Empezá a construir desde acá.')).toBeInTheDocument();
  });
});
