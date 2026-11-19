import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupInput } from './GroupInput';
import {
  DragHint,
  EmptyState,
  GroupColumn,
  GroupColumns,
  GroupInputWrap,
  GroupNameInput,
  KeyItem,
  KeysList,
} from './GroupInputBoard.styles';

const DEFAULT_KEYS = ['username', 'password', 'role', 'country', 'createdAt', 'status'];

export interface GroupInputBoardProps {
  keys?: string[];
}

export function GroupInputBoard({ keys = DEFAULT_KEYS }: GroupInputBoardProps) {
  const { t } = useTranslation();
  const [groupInput, setGroupInput] = useState<GroupInput>(
    () =>
      new GroupInput({
        groupAName: t('widgets.groupInput.defaultGroupA'),
        groupBName: t('widgets.groupInput.defaultGroupB'),
        groupAKeys: keys,
        groupBKeys: [],
      }),
  );

  function onDragStart(event: React.DragEvent, key: string) {
    event.dataTransfer.setData('text/plain', key);
  }

  function onDrop(event: React.DragEvent, targetGroupId: 'a' | 'b') {
    event.preventDefault();
    const key = event.dataTransfer.getData('text/plain');
    if (!key) return;

    setGroupInput((current) => current.withMovedKey(key, targetGroupId));
  }

  function renderKeys(items: string[]) {
    if (items.length === 0) {
      return <EmptyState>{t('widgets.groupInput.empty')}</EmptyState>;
    }

    return (
      <KeysList>
        {items.map((key) => (
          <KeyItem
            key={key}
            draggable
            onDragStart={(event: React.DragEvent) => onDragStart(event, key)}
          >
            {key}
          </KeyItem>
        ))}
      </KeysList>
    );
  }

  return (
    <GroupInputWrap>
      <DragHint>{t('widgets.groupInput.hint')}</DragHint>

      <GroupColumns>
        <GroupColumn
          onDragOver={(event: React.DragEvent) => event.preventDefault()}
          onDrop={(event: React.DragEvent) => onDrop(event, 'a')}
        >
          <GroupNameInput
            value={groupInput.groupAName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setGroupInput((current) => current.withGroupName('a', event.target.value))
            }
            placeholder={t('widgets.groupInput.defaultGroupA')}
            aria-label={t('widgets.groupInput.groupAAria')}
          />
          {renderKeys(groupInput.groupAKeys)}
        </GroupColumn>

        <GroupColumn
          onDragOver={(event: React.DragEvent) => event.preventDefault()}
          onDrop={(event: React.DragEvent) => onDrop(event, 'b')}
        >
          <GroupNameInput
            value={groupInput.groupBName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setGroupInput((current) => current.withGroupName('b', event.target.value))
            }
            placeholder={t('widgets.groupInput.defaultGroupB')}
            aria-label={t('widgets.groupInput.groupBAria')}
          />
          {renderKeys(groupInput.groupBKeys)}
        </GroupColumn>
      </GroupColumns>
    </GroupInputWrap>
  );
}
