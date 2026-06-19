import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { getTypeInfo, playerTypes } from '@/data/playerTypes';
import { PlayerType } from '@/types';
import styles from './index.module.scss';

const QuizResultPage: React.FC = () => {
  const { currentUser, currentRoom } = useAppStore();

  if (!currentUser?.profile) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❓</Text>
          <Text className={styles.emptyText}>还没有测试结果哦</Text>
          <Button
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={() => Taro.switchTab({ url: '/pages/quiz/index' })}
          >
            去测试 →
          </Button>
        </View>
      </ScrollView>
    );
  }

  const typeInfo = getTypeInfo(currentUser.profile.type);
  const scores = currentUser.profile.scores;
  const prefs = currentUser.profile.publicPrefs;

  const maxScore = Math.max(...Object.values(scores));

  const suggestions = {
    detective: [
      { icon: '🎯', title: '最适合你', desc: '侦探、警察等需要逻辑推理和控场能力的角色' },
      { icon: '⚠️', title: '注意事项', desc: '可以适当给其他玩家一些发挥空间，不要全程carry' },
      { icon: '💡', title: '小技巧', desc: '利用你的直觉优势，多注意细节和矛盾点' }
    ],
    emotional: [
      { icon: '🎯', title: '最适合你', desc: '恋人、亲人等有丰富感情线的角色' },
      { icon: '⚠️', title: '注意事项', desc: '不要过于沉浸情绪而忽略关键线索哦' },
      { icon: '💡', title: '小技巧', desc: '用你的共情能力带动其他玩家入戏' }
    ],
    observer: [
      { icon: '🎯', title: '最适合你', desc: '有秘密、需要隐藏身份的角色，如凶手、卧底' },
      { icon: '⚠️', title: '注意事项', desc: '记得适当分享信息，不要太边缘啦' },
      { icon: '💡', title: '小技巧', desc: '用你的观察力捕捉其他玩家的破绽' }
    ],
    icebreaker: [
      { icon: '🎯', title: '最适合你', desc: '喜剧角色、气氛担当，能活跃气氛的角色' },
      { icon: '⚠️', title: '注意事项', desc: '关键时刻要收住，别太过放飞自我' },
      { icon: '💡', title: '小技巧', desc: '用幽默化解尴尬，带动冷场时的氛围' }
    ]
  };

  const getReadingSpeedText = (speed: string) => {
    switch (speed) {
      case 'fast': return '快速';
      case 'medium': return '中等';
      case 'slow': return '慢速';
      default: return speed;
    }
  };

  const handleRetake = () => {
    Taro.switchTab({ url: '/pages/quiz/index' });
  };

  const handleBackToRoom = () => {
    if (currentRoom) {
      Taro.navigateTo({ url: '/pages/room-detail/index' });
    } else {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  };

  const currentSuggestions = suggestions[currentUser.profile.type];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.resultHeader}>
        <Text className={styles.typeIcon}>{typeInfo.emoji}</Text>
        <Text className={styles.typeName} style={{ color: typeInfo.color }}>
          {typeInfo.name}
        </Text>
        <Text className={styles.typeSubtitle}>
          {typeInfo.description}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>✨</Text>
          性格标签
        </Text>
        <View className={styles.traitsCard}>
          <View className={styles.traitsList}>
            {typeInfo.traits.map((trait, i) => (
              <View
                key={i}
                className={styles.traitTag}
                style={{
                  background: `${typeInfo.color}20`,
                  color: typeInfo.color
                }}
              >
                {trait}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          四维属性
        </Text>
        <View className={styles.scoresCard}>
          {(Object.keys(playerTypes) as PlayerType[]).map(type => {
            const info = playerTypes[type];
            const score = scores[type];
            const percentage = Math.min(100, (score / maxScore) * 100);
            return (
              <View key={type} className={styles.scoreItem}>
                <Text className={styles.scoreIcon}>{info.emoji}</Text>
                <View className={styles.scoreInfo}>
                  <View className={styles.scoreNameRow}>
                    <Text className={styles.scoreName}>{info.name}</Text>
                    <Text className={styles.scoreValue} style={{ color: info.color }}>
                      {score}分
                    </Text>
                  </View>
                  <View className={styles.scoreBarContainer}>
                    <View
                      className={styles.scoreBar}
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${info.color} 0%, ${info.color}80 100%)`
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>💡</Text>
          角色建议
        </Text>
        <View className={styles.suggestionsCard}>
          {currentSuggestions.map((suggestion, i) => (
            <View key={i} className={styles.suggestionItem}>
              <Text className={styles.suggestionIcon}>{suggestion.icon}</Text>
              <View className={styles.suggestionContent}>
                <Text className={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text className={styles.suggestionDesc}>{suggestion.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⚙️</Text>
          公开偏好
        </Text>
        <View className={styles.prefsCard}>
          <View className={styles.prefRow}>
            <Text className={styles.prefLabel}>能接受背锅</Text>
            <Text className={classnames(styles.prefValue, prefs.canTakeBlame ? styles.prefYes : styles.prefNo)}>
              {prefs.canTakeBlame ? '可以' : '不行'}
            </Text>
          </View>
          <View className={styles.prefRow}>
            <Text className={styles.prefLabel}>喜欢主动盘问</Text>
            <Text className={classnames(styles.prefValue, prefs.likesInterrogation ? styles.prefYes : styles.prefNo)}>
              {prefs.likesInterrogation ? '喜欢' : '不会'}
            </Text>
          </View>
          <View className={styles.prefRow}>
            <Text className={styles.prefLabel}>喜欢掌控局势</Text>
            <Text className={classnames(styles.prefValue, prefs.prefersControl ? styles.prefYes : styles.prefNo)}>
              {prefs.prefersControl ? '喜欢' : '还好'}
            </Text>
          </View>
          <View className={styles.prefRow}>
            <Text className={styles.prefLabel}>喜欢情感哭戏</Text>
            <Text className={classnames(styles.prefValue, prefs.likesEmotional ? styles.prefYes : styles.prefNo)}>
              {prefs.likesEmotional ? '喜欢' : '一般'}
            </Text>
          </View>
          <View className={styles.prefRow}>
            <Text className={styles.prefLabel}>阅读速度</Text>
            <Text className={classnames(styles.prefValue, styles.prefSpeed)}>
              {getReadingSpeedText(prefs.readingSpeed)}
            </Text>
          </View>
        </View>
        <Text style={{
          fontSize: '24rpx',
          color: '#64748B',
          marginTop: '16rpx',
          textAlign: 'center'
        }}>
          💡 这些偏好会在房间内公开，可在"我的"页面修改
        </Text>
      </View>

      <View className={styles.actions}>
        <Button
          className={classnames(styles.actionBtn, styles.secondary)}
          onClick={handleRetake}
        >
          重新测试
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.primary)}
          onClick={handleBackToRoom}
        >
          {currentRoom ? '返回房间' : '返回首页'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default QuizResultPage;
