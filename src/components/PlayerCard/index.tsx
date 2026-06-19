import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import { Player } from '@/types';
import TypeTag from '@/components/TypeTag';
import styles from './index.module.scss';

interface PlayerCardProps {
  player: Player;
  showRole?: boolean;
  showPrefs?: boolean;
  isSwapTarget?: boolean;
  onClick?: () => void;
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  showRole = true,
  showPrefs = false,
  isSwapTarget = false,
  onClick,
  className
}) => {
  const prefsLabels = {
    canTakeBlame: '能背锅',
    likesInterrogation: '爱盘问',
    readingSpeed: player.profile?.publicPrefs.readingSpeed === 'fast' ? '阅读快' : player.profile?.publicPrefs.readingSpeed === 'medium' ? '阅读中' : '阅读慢',
    prefersControl: '爱控场',
    likesEmotional: '爱哭戏'
  };

  const activePrefs = player.profile
    ? Object.entries(player.profile.publicPrefs)
        .filter(([key, value]) => value === true || key === 'readingSpeed')
        .map(([key]) => prefsLabels[key as keyof typeof prefsLabels])
    : [];

  return (
    <View
      className={classnames(
        styles.card,
        isSwapTarget && styles.swapTarget,
        onClick && styles.clickable,
        className
      )}
      onClick={onClick}
    >
      <View className={styles.header}>
        <Image
          className={styles.avatar}
          src={player.avatar}
          mode="aspectFill"
        />
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{player.name}</Text>
            {player.isHost && (
              <View className={styles.hostBadge}>
                <Text className={styles.hostText}>车主</Text>
              </View>
            )}
          </View>
          {player.profile ? (
            <TypeTag type={player.profile.type} size="sm" />
          ) : (
            <Text className={styles.noProfile}>未完成测试</Text>
          )}
        </View>
        {showRole && player.role && (
          <View className={styles.roleBadge}>
            <Text className={styles.roleText}>{player.role}</Text>
          </View>
        )}
      </View>

      {showPrefs && activePrefs.length > 0 && (
        <View className={styles.prefsContainer}>
          {activePrefs.map((pref, index) => (
            <View key={index} className={styles.prefTag}>
              <Text className={styles.prefText}>{pref}</Text>
            </View>
          ))}
        </View>
      )}

      {isSwapTarget && (
        <View className={styles.swapIndicator}>
          <Text className={styles.swapText}>点击发起换角</Text>
        </View>
      )}
    </View>
  );
};

export default PlayerCard;
