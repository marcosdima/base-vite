import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GroupInput } from './GroupInput'
import {
  DragHint,
  EmptyState,
  GroupColumn,
  GroupColumns,
  GroupInputWrap,
  GroupNameInput,
  KeyItem,
  KeysList,
} from '../../../../styles/components/inputs/groupInput.styles'

const DEFAULT_KEYS = ['username', 'password', 'role', 'country', 'createdAt', 'status']


export function GroupInputBoard({ keys = DEFAULT_KEYS }) {
  const { t } = useTranslation()
  const [groupInput, setGroupInput] = useState(
    () =>
      new GroupInput({
        groupAName: t('dashboard.groupInput.defaultGroupA'),
        groupBName: t('dashboard.groupInput.defaultGroupB'),
        groupAKeys: keys,
        groupBKeys: [],
      }),
  )

  function onDragStart(event, key) {
    event.dataTransfer.setData('text/plain', key)
  }

  function onDrop(event, targetGroupId) {
    event.preventDefault()
    const key = event.dataTransfer.getData('text/plain')
    if (!key) return

    setGroupInput((current) => current.withMovedKey(key, targetGroupId))
  }

  function renderKeys(items) {
    if (items.length === 0) {
      return <EmptyState>{t('dashboard.groupInput.empty')}</EmptyState>
    }

    return (
      <KeysList>
        {items.map((key) => (
          <KeyItem
            key={key}
            draggable
            onDragStart={(event) => onDragStart(event, key)}
          >
            {key}
          </KeyItem>
        ))}
      </KeysList>
    )
  }

  return (
    <GroupInputWrap>
      <DragHint>{t('dashboard.groupInput.hint')}</DragHint>

      <GroupColumns>
        <GroupColumn onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, 'a')}>
          <GroupNameInput
            value={groupInput.groupAName}
            onChange={(event) => setGroupInput((current) => current.withGroupName('a', event.target.value))}
            placeholder={t('dashboard.groupInput.defaultGroupA')}
            aria-label={t('dashboard.groupInput.groupAAria')}
          />
          {renderKeys(groupInput.groupAKeys)}
        </GroupColumn>

        <GroupColumn onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, 'b')}>
          <GroupNameInput
            value={groupInput.groupBName}
            onChange={(event) => setGroupInput((current) => current.withGroupName('b', event.target.value))}
            placeholder={t('dashboard.groupInput.defaultGroupB')}
            aria-label={t('dashboard.groupInput.groupBAria')}
          />
          {renderKeys(groupInput.groupBKeys)}
        </GroupColumn>
      </GroupColumns>
    </GroupInputWrap>
  )
}
