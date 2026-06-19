import React, { useState } from 'react';
import { View, Text, Input, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { Player } from '@/types';
import styles from './index.module.scss';

const RoomPage: React.FC = () => {
  const { rooms, createRoom, joinRoom, setCurrentRoom, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [scriptName, setScriptName] = useState('');
  const [roleCount, setRoleCount] = useState(6);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    if (!scriptName.trim()) {
      Taro.showToast({
        title: '请输入剧本名',
        icon: 'none'
      });
      return;
    }

    if (!currentUser) {
      const mockUser: Player = {
        id: 'user_' + Date.now(),
        name: '玩家' + Math.floor(Math.random() * 1000),
        avatar: 'https://picsum.photos/id/64/200/200',
        profile: null,
        role: null,
        isHost: true
      };
      useAppStore.getState().setCurrentUser(mockUser);
    }

    const room = createRoom(scriptName.trim(), roleCount);
    console.log('[Room] 房间已创建:', room.code);

    Taro.showToast({
      title: '房间创建成功！',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/room-detail/index' });
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      Taro.showToast({
        title: '请输入邀请码',
        icon: 'none'
      });
      return;
    }

    const room = joinRoom(roomCode.trim());
    
    if (room) {
      Taro.showToast({
        title: '加入成功！',
        icon: 'success'
      });

      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/room-detail/index' });
      }, 1000);
    } else {
      Taro.showToast({
        title: '房间不存在或已满',
        icon: 'none'
      });
    }
  };

  const handleEnterRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      Taro.navigateTo({ url: '/pages/room-detail/index' });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '等待中';
      case 'matching': return '匹配中';
      case 'matched': return '已匹配';
      case 'playing': return '游戏中';
      default: return status;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabContainer}>
        <Text
          className={classnames(styles.tabItem, activeTab === 'create' && styles.active)}
          onClick={() => setActiveTab('create')}
        >
          🚗 创建房间
        </Text>
        <Text
          className={classnames(styles.tabItem, activeTab === 'join' && styles.active)}
          onClick={() => setActiveTab('join')}
        >
          🎫 加入房间
        </Text>
      </View>

      {activeTab === 'create' ? (
        <View className={styles.formCard}>
          <Text className={styles.formTitle}>🚗 车主开团</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>📜 剧本名称</Text>
            <Input
              className={styles.formInput}
              placeholder="输入剧本名，如：窗边的女人"
              value={scriptName}
              onInput={(e) => setScriptName(e.detail.value)}
              maxlength={20}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>👥 角色数量</Text>
            <View className={styles.roleCountContainer}>
              {[4, 5, 6, 7, 8].map((num) => (
                <Button
                  key={num}
                  className={classnames(styles.roleCountBtn, roleCount === num && styles.active)}
                  onClick={() => setRoleCount(num)}
                >
                  {num}人
                </Button>
              ))}
            </View>
          </View>

          <Button
            className={styles.submitBtn}
            onClick={handleCreateRoom}
            disabled={!scriptName.trim()}
          >
            创建房间 🎉
          </Button>
        </View>
      ) : (
        <View className={styles.formCard}>
          <Text className={styles.formTitle}>🎫 乘客上车</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>🔑 房间邀请码</Text>
            <Input
              className={styles.formInput}
              placeholder="输入6位邀请码"
              value={roomCode}
              onInput={(e) => setRoomCode(e.detail.value.toUpperCase())}
              maxlength={6}
            />
          </View>

          <Button
            className={styles.submitBtn}
            onClick={handleJoinRoom}
            disabled={!roomCode.trim()}
          >
            加入房间 🚀
          </Button>
        </View>
      )}

      <View style={{ marginTop: '48rpx' }}>
        <Text style={{
          fontSize: '32rpx',
          fontWeight: '600',
          color: '#F1F5F9',
          marginBottom: '24rpx'
        }}>
          🔥 热门房间
        </Text>

        {rooms.length > 0 ? (
          <View className={styles.roomList}>
            {rooms.map((room) => (
              <View
                key={room.id}
                className={styles.roomCard}
                onClick={() => handleEnterRoom(room.id)}
              >
                <View className={styles.roomHeader}>
                  <Text className={styles.roomScript}>{room.scriptName}</Text>
                  <Text className={styles.roomCode}>{room.code}</Text>
                </View>

                <View className={styles.roomMeta}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text className={styles.roomPlayers}>
                      {room.players.length}/{room.roleCount} 人
                    </Text>
                    <View className={styles.playerAvatars}>
                      {room.players.slice(0, 3).map((player, i) => (
                        <Image
                          key={i}
                          className={styles.miniAvatar}
                          src={player.avatar}
                          mode="aspectFill"
                        />
                      ))}
                    </View>
                  </View>
                  <Text className={classnames(styles.roomStatus, styles[room.status])}>
                    {getStatusText(room.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎲</Text>
            <Text className={styles.emptyTitle}>暂无房间</Text>
            <Text className={styles.emptyDesc}>
              赶快创建一个房间，{'\n'}
              邀请小伙伴一起来打本吧！
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RoomPage;
