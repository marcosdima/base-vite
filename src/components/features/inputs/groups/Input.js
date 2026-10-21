export class Input {
  constructor({ id = 'input', value = '', required = false } = {}) {
    this.id = id
    this.value = value
    this.required = required
  }


  withValue(nextValue) {
    return new Input({
      id: this.id,
      value: nextValue,
      required: this.required,
    })
  }


  isValid() {
    if (!this.required) return true
    return String(this.value).trim().length > 0
  }


  reset() {
    return this.withValue('')
  }
}
