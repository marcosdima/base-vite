export class Input {
  id: string;
  value: string;
  required: boolean;

  constructor({
    id = 'input',
    value = '',
    required = false,
  }: { id?: string; value?: string; required?: boolean } = {}) {
    this.id = id;
    this.value = value;
    this.required = required;
  }

  withValue(nextValue: string): Input {
    return new Input({
      id: this.id,
      value: nextValue,
      required: this.required,
    });
  }

  isValid(): boolean {
    if (!this.required) return true;
    return String(this.value).trim().length > 0;
  }

  reset(): Input {
    return this.withValue('');
  }
}
