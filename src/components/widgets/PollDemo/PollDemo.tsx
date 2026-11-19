import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Poll } from './Poll';
import {
  PollActionButton,
  PollActions,
  PollOptionButton,
  PollOptions,
  PollQuestion,
  PollResult,
  PollWrap,
} from './PollDemo.styles';

function createBasePoll(t: (key: string) => string) {
  return new Poll({
    question: t('widgets.pollExample.question'),
    options: [
      { id: 'a', label: t('widgets.pollExample.optionA'), votes: 0, percentage: 0 },
      { id: 'b', label: t('widgets.pollExample.optionB'), votes: 0, percentage: 0 },
      { id: 'c', label: t('widgets.pollExample.optionC'), votes: 0, percentage: 0 },
    ],
    isOpen: true,
  });
}

export function PollDemo() {
  const { t } = useTranslation();
  const basePoll = useMemo(() => createBasePoll(t), [t]);
  const [poll, setPoll] = useState<Poll>(basePoll);

  function handleVote(optionId: string) {
    setPoll((current) => current.vote(optionId));
  }

  function handleClose() {
    setPoll((current) => current.close());
  }

  function handleReset() {
    setPoll(createBasePoll(t));
  }

  const results = poll.getResults();

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
          {t('widgets.pollExample.close')}
        </PollActionButton>
        <PollActionButton type="button" onClick={handleReset}>
          {t('widgets.pollExample.reset')}
        </PollActionButton>
      </PollActions>
    </PollWrap>
  );
}
