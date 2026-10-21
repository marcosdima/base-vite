import { Input } from './Input'

export class GroupInput extends Input {
  constructor({
    groupAName = 'Group A',
    groupBName = 'Group B',
    groupAKeys = [],
    groupBKeys = [],
  } = {}) {
    super({ id: 'group-input' })
    this.groupAName = groupAName
    this.groupBName = groupBName
    this.groupAKeys = [...groupAKeys]
    this.groupBKeys = [...groupBKeys]
  }


  withGroupName(groupId, name) {
    const nextName = name.trim() || (groupId === 'a' ? 'Group A' : 'Group B')

    return new GroupInput({
      groupAName: groupId === 'a' ? nextName : this.groupAName,
      groupBName: groupId === 'b' ? nextName : this.groupBName,
      groupAKeys: this.groupAKeys,
      groupBKeys: this.groupBKeys,
    })
  }


  withMovedKey(key, targetGroupId) {
    const sourceGroupId = this.groupAKeys.includes(key) ? 'a' : this.groupBKeys.includes(key) ? 'b' : null
    if (!sourceGroupId || sourceGroupId === targetGroupId) return this

    const nextGroupAKeys = this.groupAKeys.filter((item) => item !== key)
    const nextGroupBKeys = this.groupBKeys.filter((item) => item !== key)

    if (targetGroupId === 'a') nextGroupAKeys.push(key)
    if (targetGroupId === 'b') nextGroupBKeys.push(key)

    return new GroupInput({
      groupAName: this.groupAName,
      groupBName: this.groupBName,
      groupAKeys: nextGroupAKeys,
      groupBKeys: nextGroupBKeys,
    })
  }
}
