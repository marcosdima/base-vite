export class Poll {
  constructor({ question = '', options = [], isOpen = true } = {}) {
    this.question = question
    this.options = options.map((option) => ({
      id: option.id,
      label: option.label,
      votes: option.votes ?? 0,
    }))
    this.isOpen = isOpen
  }


  withQuestion(question) {
    return new Poll({
      question,
      options: this.options,
      isOpen: this.isOpen,
    })
  }


  addOption(label) {
    const trimmedLabel = String(label).trim()
    if (!trimmedLabel) return this

    return new Poll({
      question: this.question,
      options: [
        ...this.options,
        {
          id: `option-${this.options.length + 1}`,
          label: trimmedLabel,
          votes: 0,
        },
      ],
      isOpen: this.isOpen,
    })
  }


  vote(optionId) {
    if (!this.isOpen) return this

    return new Poll({
      question: this.question,
      options: this.options.map((option) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
      ),
      isOpen: this.isOpen,
    })
  }


  close() {
    return new Poll({ question: this.question, options: this.options, isOpen: false })
  }


  getResults() {
    const totalVotes = this.options.reduce((acc, option) => acc + option.votes, 0)

    return this.options.map((option) => ({
      ...option,
      percentage: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100),
    }))
  }
}
