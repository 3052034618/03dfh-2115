import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import { Player } from '@/types';
import TypeTag from '@/components/TypeTag';
import styles from './index.module.scss';

interface RoleCardProps {
  player: Player;
  role: string;
  reason: string;
  score: number;
  showSwap?: boolean;
  onSwap?: () => void;
  className?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  player,
  role,
  reason,
  score,
  showSwap = false,
  onSwap,
  className
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 90) return '#34D399';
    if (s >= 75) return '#60A5FA';
    if (s >= 60) return '#FBBF24';
    return '#F87171';
  };

  return (
    <View
      className={classnames(styles.card, className)}
    >
      <View className={styles.header}>
        <Image
          className={styles.avatar}
          src={player.avatar}
          mode="aspectFill"
        />
        <View className={styles.playerInfo}>
          <Text className={styles.playerName}>{player.name}</Text>
          {player.profile && (
            <TypeTag type={player.profile.type} size="sm" />
          )}
        </View>
        <View className={styles.roleInfo}>
          <Text className={styles.roleName}>{role}</Text>
          <View
            className={styles.scoreBadge}
            style={{ backgroundColor: `${getScoreColor(score)}20` }}
          >
            <Text className={styles.scoreText} style={{ color: getScoreColor(score) }}>
              {Math.round(score)}分
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.reasonContainer}>
        <Text className={styles.reasonLabel}>💡 分配理由</Text>
        <Text className={styles.reasonText}>{reason}</Text>
      </View>

      {showSwap && onSwap && (
        <View className={styles.swapContainer}>
          <Text
            className={styles.swapBtn}
            onClick={onSwap}
          >
            🔄 发起换角
          </Text>
        </View>
      )}
    </View>
  );
};

export default RoleCard;
