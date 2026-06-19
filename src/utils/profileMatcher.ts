import { PlayerType, PlayerProfile } from '@/types';
import { playerTypes } from '@/data/playerTypes';
import { quizQuestions } from '@/data/quizQuestions';

export const calculateScores = (
  answers: Record<number, number>
): Record<PlayerType, number> => {
  const scores: Record<PlayerType, number> = {
    detective: 0,
    emotional: 0,
    observer: 0,
    icebreaker: 0
  };

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const qId = parseInt(questionId);
    const question = quizQuestions.find(q => q.id === qId);
    if (question && question.options[optionIndex]) {
      const optionScores = question.options[optionIndex].scores;
      (Object.keys(optionScores) as PlayerType[]).forEach((type) => {
        scores[type] += optionScores[type];
      });
    }
  });

  return scores;
};

export const determinePlayerType = (
  scores: Record<PlayerType, number>
): PlayerType => {
  let maxScore = -1;
  let maxType: PlayerType = 'detective';

  (Object.keys(scores) as PlayerType[]).forEach((type) => {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      maxType = type;
    }
  });

  return maxType;
};

export const generateProfile = (
  scores: Record<PlayerType, number>,
  answers: Record<number, number>
): PlayerProfile => {
  const type = determinePlayerType(scores);
  const typeInfo = playerTypes[type];

  const canTakeBlame = answers[2] === 0 || answers[2] === 1;
  const likesInterrogation = answers[3] === 0;
  const readingSpeed = answers[4] === 0 ? 'fast' : answers[4] === 1 ? 'medium' : 'slow';
  const prefersControl = answers[1] === 0 || answers[1] === 1;
  const likesEmotional = answers[1] === 1 || answers[6] === 1;

  return {
    type,
    name: typeInfo.name,
    scores,
    publicPrefs: {
      canTakeBlame,
      likesInterrogation,
      readingSpeed,
      prefersControl,
      likesEmotional
    }
  };
};

export const getTypeCompatibility = (
  typeA: PlayerType,
  typeB: PlayerType
): number => {
  const compatibility: Record<PlayerType, Record<PlayerType, number>> = {
    detective: { detective: 60, emotional: 70, observer: 90, icebreaker: 80 },
    emotional: { detective: 70, emotional: 50, observer: 75, icebreaker: 85 },
    observer: { detective: 90, emotional: 75, observer: 65, icebreaker: 70 },
    icebreaker: { detective: 80, emotional: 85, observer: 70, icebreaker: 60 }
  };
  return compatibility[typeA][typeB];
};
