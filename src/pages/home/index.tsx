import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import TypeTag from '@/components/TypeTag';
import { getTypeInfo } from '@/data/playerTypes';
import { Player } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { currentUser, setCurrentUser, currentRoom } = useAppStore();
  const [historyRecords] = useState([
    { script: '窗边的女人', date: '2026-06-15', role: '侦探', players: 6 },
    { script: '年轮', date: '2026-06-10', role: '凶手', players: 5 }
  ]);

  useEffect(() => {
    if (!currentUser) {
      const mockUser: Player = {
        id: 'user_' + Date.now(),
        name: '玩家' + Math.floor(Math.random() * 1000),
        avatar: 'https://picsum.photos/id/' + (64 + Math.floor(Math.random() * 10)) + '/200/200',
        profile: null,
        role: null,
        isHost: false
      };
      setCurrentUser(mockUser);
      console.log('[Home] 已初始化用户:', mockUser.name);
    }
  }, [currentUser, setCurrentUser]);

  const handleCreateRoom = () => {
    Taro.switchTab({ url: '/pages/room/index' });
  };

  const handleJoinRoom = () => {
    Taro.switchTab({ url: '/pages/room/index' });
  };

  const handleTakeQuiz = () => {
    Taro.switchTab({ url: '/pages/quiz/index' });
  };

  const handleEnterRoom = () => {
    if (currentRoom) {
      Taro.navigateTo({ url: '/pages/room-detail/index' });
    }
  };

  const typeInfo = currentUser?.profile ? getTypeInfo(currentUser.profile.type) : null;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroSection}>
        <Text className={styles.heroTitle}>🎭 拼车分角助手</Text>
        <Text className={styles.heroSubtitle}>拒绝抢C位，让性格决定角色</Text>

        <View className={styles.profileCard}>
          <View className={styles.profileHeader}>
            <Image
              className={styles.avatar}
              src={currentUser?.avatar || 'https://picsum.photos/id/64/200/200'}
              mode="aspectFill"
            />
            <View className={styles.profileInfo}>
              <Text className={styles.userName}>{currentUser?.name || '神秘玩家'}</Text>
              {currentUser?.profile ? (
                <TypeTag type={currentUser.profile.type} size="lg" />
              ) : (
                <Text style={{ color: '#FBBF24', fontSize: '24rpx' }}>⚠️ 未完成测试</Text>
              )}
            </View>
          </View>

          {typeInfo && (
            <>
              <Text style={{ color: '#94A3B8', fontSize: '28rpx', lineHeight: '1.6' }}>
                {typeInfo.description}
              </Text>
              <View className={styles.traitsContainer}>
                {typeInfo.traits.map((trait, index) => (
                  <View key={index} className={styles.traitTag}>
                    <Text className={styles.traitText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {!currentUser?.profile && (
            <View className={styles.noProfile}>
              <Text className={styles.noProfileText}>
                还没做性格测试？先测测你是什么类型的玩家吧！
              </Text>
              <Button
                className={styles.testBtn}
                onClick={handleTakeQuiz}
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: '#fff',
                  borderRadius: '48rpx',
                  padding: '12rpx 24rpx',
                  fontSize: '24rpx',
                  fontWeight: '600'
                }}
              >
                去测试
              </Button>
            </View>
          )}

          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>5</Text>
              <Text className={styles.statLabel}>打本次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{typeInfo?.emoji || '❓'}</Text>
              <Text className={styles.statLabel}>{typeInfo?.name || '待测试'}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>3</Text>
              <Text className={styles.statLabel}>换角次数</Text>
            </View>
          </View>
        </View>
      </View>

      {currentRoom && (
        <View style={{ padding: '0 32rpx', marginBottom: '32rpx' }}>
          <Button
            onClick={handleEnterRoom}
            style={{
              width: '100%',
              height: '96rpx',
              background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
              color: '#fff',
              borderRadius: '48rpx',
              fontSize: '32rpx',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none'
            }}
          >
            👉 进入当前房间：{currentRoom.scriptName}
          </Button>
        </View>
      )}

      <View className={styles.quickActions}>
        <Text className={styles.sectionTitle}>⚡ 快速操作</Text>
        <View className={styles.actionGrid}>
          <View className={styles.actionCard} onClick={handleCreateRoom}>
            <Text className={styles.actionIcon}>🚗</Text>
            <Text className={styles.actionTitle}>创建房间</Text>
            <Text className={styles.actionDesc}>车主开团</Text>
          </View>
          <View className={styles.actionCard} onClick={handleJoinRoom}>
            <Text className={styles.actionIcon}>🎫</Text>
            <Text className={styles.actionTitle}>加入房间</Text>
            <Text className={styles.actionDesc}>输入邀请码</Text>
          </View>
          <View className={styles.actionCard} onClick={handleTakeQuiz}>
            <Text className={styles.actionIcon}>📝</Text>
            <Text className={styles.actionTitle}>{currentUser?.profile ? '重测' : '测试'}</Text>
            <Text className={styles.actionDesc}>{currentUser?.profile ? '更新画像' : '生成画像'}</Text>
          </View>
          <View className={styles.actionCard} onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>
            <Text className={styles.actionIcon}>⚙️</Text>
            <Text className={styles.actionTitle}>偏好设置</Text>
            <Text className={styles.actionDesc}>公开信息</Text>
          </View>
        </View>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.sectionTitle}>📜 历史记录</Text>
        {historyRecords.length > 0 ? (
          historyRecords.map((record, index) => (
            <View key={index} className={styles.historyCard}>
              <View className={styles.historyHeader}>
                <Text className={styles.historyScript}>{record.script}</Text>
                <Text className={styles.historyDate}>{record.date}</Text>
              </View>
              <Text className={styles.historyMeta}>
                你的角色：{record.role} · {record.players}人局
              </Text>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎲</Text>
            <Text className={styles.emptyText}>还没有打本记录哦</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
