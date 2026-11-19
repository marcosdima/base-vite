import type {
  TabsContentProps as RadixTabsContentProps,
  TabsListProps as RadixTabsListProps,
  TabsProps as RadixTabsProps,
  TabsTriggerProps as RadixTabsTriggerProps,
} from '@radix-ui/react-tabs';
import {
  StyledTabsContent,
  StyledTabsList,
  StyledTabsRoot,
  StyledTabsTrigger,
} from './Tabs.styles';

export type TabsProps = RadixTabsProps;
export type TabsListProps = RadixTabsListProps;
export type TabsTriggerProps = RadixTabsTriggerProps;
export type TabsContentProps = RadixTabsContentProps;

export function Tabs(props: TabsProps) {
  return <StyledTabsRoot {...props} />;
}

export function TabsList(props: TabsListProps) {
  return <StyledTabsList {...props} />;
}

export function TabsTrigger(props: TabsTriggerProps) {
  return <StyledTabsTrigger {...props} />;
}

export function TabsContent(props: TabsContentProps) {
  return <StyledTabsContent {...props} />;
}
