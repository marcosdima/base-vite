import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Poll } from './Poll'
import {
  PollActionButton,
  PollActions,
  PollOptionButton,
  PollOptions,
  PollQuestion,
  PollResult,
  PollWrap,
} from '../../../../styles/components/inputs/pollDemo.styles'

function createBasePoll(t) {
  return new Poll({
    question: t('dashboard.pollExample.question'),
    options: [
      { id: 'a', label: t('dashboard.pollExample.optionA'), votes: 0 },
      { id: 'b', label: t('dashboard.pollExample.optionB'), votes: 0 },
      { id: 'c', label: t('dashboard.pollExample.optionC'), votes: 0 },
    ],
    isOpen: true,
  })
}


export function PollDemo() {
  const { t, i18n } = useTranslation()
  const basePoll = useMemo(() => createBasePoll(t), [i18n.language, t])
  const [poll, setPoll] = useState(basePoll)

  function handleVote(optionId) {
    setPoll((current) => current.vote(optionId))
  }

  function handleClose() {
    setPoll((current) => current.close())
  }

  function handleReset() {
    setPoll(createBasePoll(t))
  }

  const results = poll.getResults()

  return (
    <PollWrap>
      <PollQuestion>{poll.question}</PollQuestion>

      <PollOptions>
        {results.map((option) => (
          <PollOptionButton
            key={option.id}
            type="button"
            onClick={() => handleVote(option.id)}
            disabled={!poll.isOpen}
          >
            {option.label}
            <PollResult>{`${option.votes} (${option.percentage}%)`}</PollResult>
          </PollOptionButton>
        ))}
      </PollOptions>

      <PollActions>
        <PollActionButton type="button" onClick={handleClose}>
          {t('dashboard.pollExample.close')}
        </PollActionButton>
        <PollActionButton type="button" onClick={handleReset}>
          {t('dashboard.pollExample.reset')}
        </PollActionButton>
      </PollActions>
    </PollWrap>
  )
}
