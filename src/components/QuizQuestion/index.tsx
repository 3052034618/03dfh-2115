import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import { QuizQuestion as QuizQuestionType } from '@/types';
import styles from './index.module.scss';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
  disabled?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onSelect,
  disabled = false
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.questionCard}>
        <Text className={styles.questionNumber}>Q{question.id}</Text>
        <Text className={styles.questionText}>{question.question}</Text>
      </View>

      <View className={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <Button
            key={index}
            className={classnames(
              styles.optionBtn,
              selectedOption === index && styles.selected,
              disabled && styles.disabled
            )}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
          >
            <Text className={styles.optionLetter}>
              {String.fromCharCode(65 + index)}
            </Text>
            <Text className={styles.optionText}>{option.text}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
};

export default QuizQuestion;
