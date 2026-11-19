import { describe, expect, it } from 'vitest';
import { render, screen } from '@/test/render';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

describe('Tabs', () => {
  it('renders triggers and displays active tab content', () => {
    render(
      <Tabs defaultValue="first">
        <TabsList aria-label="Sample sections">
          <TabsTrigger value="first">First Tab</TabsTrigger>
          <TabsTrigger value="second">Second Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="first">First panel content</TabsContent>
        <TabsContent value="second">Second panel content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'First Tab' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('First panel content')).toBeInTheDocument();
  });
});
