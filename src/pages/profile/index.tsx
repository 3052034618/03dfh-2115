import React from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { getTypeInfo, playerTypes } from '@/data/playerTypes';
import { PlayerType } from '@/types';
import TypeTag from '@/components/TypeTag';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAppStore();

  const handleTakeQuiz = () => {
    Taro.switchTab({ url: '/pages/quiz/index' });
  };

  const handleCopyId = () => {
    if (currentUser?.id) {
      Taro.setClipboardData({
        data: currentUser.id,
        success: () => {
          Taro.showToast({ title: '已复制ID', icon: 'success' });
        }
      });
    }
  };

  const handleTogglePref = (key: keyof NonNullable<NonNullable<typeof currentUser>['profile']>['publicPrefs']) => {
    if (!currentUser?.profile) return;
    
    const newPrefs = { ...currentUser.profile.publicPrefs };
    if (key === 'readingSpeed') {
      const speeds: Array<'slow' | 'medium' | 'fast'> = ['slow', 'medium', 'fast'];
      const currentIndex = speeds.indexOf(newPrefs.readingSpeed);
      newPrefs.readingSpeed = speeds[(currentIndex + 1) % 3];
    } else {
      (newPrefs as any)[key] = !(newPrefs as any)[key];
    }

    updateUserProfile({
      ...currentUser.profile,
      publicPrefs: newPrefs
    });
  };

  const getReadingSpeedText = (speed: string) => {
    switch (speed) {
      case 'fast': return '快速';
      case 'medium': return '中等';
      case 'slow': return '慢速';
      default: return speed;
    }
  };

  if (!currentUser) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.emptyProfile}>
          <Text className={styles.emptyIcon}>👤</Text>
          <Text className={styles.emptyText}>还未登录</Text>
        </View>
      </ScrollView>
    );
  }

  const typeInfo = currentUser.profile ? getTypeInfo(currentUser.profile.type) : null;
  const scores = currentUser.profile?.scores;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.headerSection}>
        <View className={styles.profileHeader}>
          <Image
            className={styles.avatar}
            src={currentUser.avatar}
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <Text
              className={styles.userId}
              onClick={handleCopyId}
            >
              ID: {currentUser.id.slice(0, 10)}... (点击复制)
            </Text>
          </View>
        </View>

        {typeInfo ? (
          <View className={styles.profileCard}>
            <View className={styles.typeSection}>
              <Text className={styles.typeIcon}>{typeInfo.emoji}</Text>
              <Text className={styles.typeName}>{typeInfo.name}</Text>
              <Text className={styles.typeDesc}>{typeInfo.description}</Text>
              <View className={styles.traitsContainer}>
                {typeInfo.traits.map((trait, i) => (
                  <View
                    key={i}
                    className={styles.traitTag}
                    style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                  >
                    {trait}
                  </View>
                ))}
              </View>
            </View>

            {scores && (
              <View className={styles.scoresSection}>
                <Text className={styles.scoresTitle}>📊 四维属性</Text>
                {(Object.keys(playerTypes) as PlayerType[]).map(type => {
                  const info = playerTypes[type];
                  const score = scores[type];
                  const maxScore = 30;
                  const percentage = Math.min(100, (score / maxScore) * 100);
                  return (
                    <View key={type} className={styles.scoreItem}>
                      <Text className={styles.scoreIcon}>{info.emoji}</Text>
                      <Text className={styles.scoreName}>{info.name.slice(0, 4)}</Text>
                      <View className={styles.scoreBarContainer}>
                        <View
                          className={styles.scoreBar}
                          style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${info.color} 0%, ${info.color}80 100%)`
                          }}
                        />
                      </View>
                      <Text className={styles.scoreValue} style={{ color: info.color }}>
                        {score}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <View className={styles.profileCard}>
            <View className={styles.emptyProfile}>
              <Text className={styles.emptyIcon}>❓</Text>
              <Text className={styles.emptyText}>还没完成性格测试哦</Text>
              <Button className={styles.emptyBtn} onClick={handleTakeQuiz}>
                去测试 →
              </Button>
            </View>
          </View>
        )}
      </View>

      {currentUser.profile && (
        <View className={styles.prefsSection}>
          <Text className={styles.sectionTitle}>⚙️ 公开偏好</Text>
          <View className={styles.prefCard}>
            <View className={styles.prefRow}>
              <Text className={styles.prefLabel}>能接受背锅</Text>
              <View
                className={classnames(styles.switch, currentUser.profile.publicPrefs.canTakeBlame && styles.active)}
                onClick={() => handleTogglePref('canTakeBlame')}
              >
                <View className={styles.switchKnob} />
              </View>
            </View>
            <View className={styles.prefRow}>
              <Text className={styles.prefLabel}>喜欢主动盘问</Text>
              <View
                className={classnames(styles.switch, currentUser.profile.publicPrefs.likesInterrogation && styles.active)}
                onClick={() => handleTogglePref('likesInterrogation')}
              >
                <View className={styles.switchKnob} />
              </View>
            </View>
            <View className={styles.prefRow}>
              <Text className={styles.prefLabel}>喜欢掌控局势</Text>
              <View
                className={classnames(styles.switch, currentUser.profile.publicPrefs.prefersControl && styles.active)}
                onClick={() => handleTogglePref('prefersControl')}
              >
                <View className={styles.switchKnob} />
              </View>
            </View>
            <View className={styles.prefRow}>
              <Text className={styles.prefLabel}>喜欢情感哭戏</Text>
              <View
                className={classnames(styles.switch, currentUser.profile.publicPrefs.likesEmotional && styles.active)}
                onClick={() => handleTogglePref('likesEmotional')}
              >
                <View className={styles.switchKnob} />
              </View>
            </View>
            <View className={styles.prefRow}>
              <Text className={styles.prefLabel}>阅读速度</Text>
              <Text
                className={styles.prefValue}
                onClick={() => handleTogglePref('readingSpeed')}
                style={{ color: '#6366F1', fontWeight: '600' }}
              >
                {getReadingSpeedText(currentUser.profile.publicPrefs.readingSpeed)} →
              </Text>
            </View>
          </View>
          <Text style={{
            fontSize: '24rpx',
            color: '#64748B',
            marginTop: '16rpx',
            textAlign: 'center'
          }}>
            💡 这些偏好会在房间内向其他玩家公开
          </Text>
        </View>
      )}

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={handleTakeQuiz}>
          <Text className={styles.menuIcon}>📝</Text>
          <Text className={styles.menuText}>{currentUser.profile ? '重新测试' : '性格测试'}</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>📜</Text>
          <Text className={styles.menuText}>历史记录</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>❓</Text>
          <Text className={styles.menuText}>帮助中心</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>ℹ️</Text>
          <Text className={styles.menuText}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
