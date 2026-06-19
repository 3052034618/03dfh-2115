import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  variant?: 'primary' | 'success' | 'warning';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showText = true,
  variant = 'primary',
  className
}) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <View className={classnames(styles.container, className)}>
      <View className={styles.header}>
        {showText && (
          <Text className={styles.text}>
            第 {current} / {total} 题
          </Text>
        )}
        <Text className={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>
      <View className={styles.barContainer}>
        <View
          className={classnames(styles.bar, styles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
