import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { PlayerType } from '@/types';
import { getTypeInfo } from '@/data/playerTypes';
import styles from './index.module.scss';

interface TypeTagProps {
  type: PlayerType;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
  showName?: boolean;
  className?: string;
}

const TypeTag: React.FC<TypeTagProps> = ({
  type,
  size = 'md',
  showEmoji = true,
  showName = true,
  className
}) => {
  const typeInfo = getTypeInfo(type);

  return (
    <View
      className={classnames(
        styles.tag,
        styles[size],
        className
      )}
      style={{ backgroundColor: `${typeInfo.color}20`, borderColor: typeInfo.color }}
    >
      {showEmoji && <Text className={styles.emoji}>{typeInfo.emoji}</Text>}
      {showName && <Text className={styles.text} style={{ color: typeInfo.color }}>{typeInfo.name}</Text>}
    </View>
  );
};

export default TypeTag;
