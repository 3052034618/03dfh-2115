import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { assignRoles, calculateSwapImpact } from '@/utils/roleAssigner';
import { Player, MatchResult } from '@/types';
import PlayerCard from '@/components/PlayerCard';
import RoleCard from '@/components/RoleCard';
import styles from './index.module.scss';

const RoomDetailPage: React.FC = () => {
  const { currentRoom, currentUser, leaveRoom, updateRoomStatus, setAssignedRoles, requestSwap, addPlayerToRoom } = useAppStore();
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTarget, setSwapTarget] = useState<Player | null>(null);
  const [swapImpact, setSwapImpact] = useState<any>(null);

  useEffect(() => {
    if (!currentRoom) {
      Taro.showToast({
        title: '未进入房间',
        icon: 'none'
      });
      setTimeout(() => Taro.navigateBack(), 1000);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (currentRoom && currentRoom.players.length < currentRoom.roleCount) {
      const mockPlayers: Player[] = [
        { id: 'mock_1', name: '玩家A', avatar: 'https://picsum.photos/id/91/200/200', profile: { type: 'emotional', name: '情感爆发型', scores: { detective: 8, emotional: 20, observer: 12, icebreaker: 10 }, publicPrefs: { canTakeBlame: true, likesInterrogation: false, readingSpeed: 'slow', prefersControl: false, likesEmotional: true } }, role: null, isHost: false },
        { id: 'mock_2', name: '玩家B', avatar: 'https://picsum.photos/id/177/200/200', profile: { type: 'observer', name: '暗线观察型', scores: { detective: 12, emotional: 8, observer: 22, icebreaker: 8 }, publicPrefs: { canTakeBlame: true, likesInterrogation: false, readingSpeed: 'fast', prefersControl: false, likesEmotional: false } }, role: null, isHost: false },
        { id: 'mock_3', name: '玩家C', avatar: 'https://picsum.photos/id/338/200/200', profile: { type: 'icebreaker', name: '欢乐破冰型', scores: { detective: 10, emotional: 12, observer: 8, icebreaker: 20 }, publicPrefs: { canTakeBlame: false, likesInterrogation: true, readingSpeed: 'medium', prefersControl: false, likesEmotional: false } }, role: null, isHost: false },
      ];

      const playersToAdd = currentRoom.roleCount - currentRoom.players.length;
      mockPlayers.slice(0, playersToAdd).forEach(player => {
        if (!currentRoom.players.find(p => p.id === player.id)) {
          addPlayerToRoom(player);
        }
      });
    }
  }, [currentRoom?.id]);

  useEffect(() => {
    if (currentRoom?.status === 'matched' && currentRoom.assignedRoles) {
      const result = assignRoles(currentRoom.players, currentRoom.roleCount);
      setMatchResult(result);
    }
  }, [currentRoom?.status, currentRoom?.assignedRoles]);

  if (!currentRoom || !currentUser) {
    return <View className={styles.page} />;
  }

  const handleCopyCode = () => {
    Taro.setClipboardData({
      data: currentRoom.code,
      success: () => {
        Taro.showToast({ title: '邀请码已复制', icon: 'success' });
      }
    });
  };

  const handleStartMatching = () => {
    const untestedPlayers = currentRoom.players.filter(p => !p.profile);
    
    if (untestedPlayers.length > 0) {
      Taro.showModal({
        title: '提示',
        content: `还有 ${untestedPlayers.length} 位玩家未完成性格测试，可能影响匹配准确度。是否继续？`,
        confirmText: '继续',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            doMatch();
          }
        }
      });
    } else {
      doMatch();
    }
  };

  const doMatch = () => {
    updateRoomStatus('matching');
    
    setTimeout(() => {
      const result = assignRoles(currentRoom.players, currentRoom.roleCount);
      setMatchResult(result);
      
      const rolesMap: Record<string, string> = {};
      result.suggestions.forEach(s => {
        rolesMap[s.playerId] = s.role;
      });
      setAssignedRoles(rolesMap);
      
      console.log('[Room] 角色匹配完成:', result);
      
      Taro.showToast({
        title: '匹配完成！',
        icon: 'success'
      });
    }, 1500);
  };

  const handleLeaveRoom = () => {
    Taro.showModal({
      title: '确认离开',
      content: '确定要离开房间吗？',
      success: (res) => {
        if (res.confirm) {
          leaveRoom();
          Taro.navigateBack();
        }
      }
    });
  };

  const handleInitiateSwap = (targetPlayer: Player) => {
    if (!currentUser.role || !targetPlayer.role) return;
    
    const impact = calculateSwapImpact(
      currentUser,
      targetPlayer,
      currentUser.role,
      targetPlayer.role
    );
    
    setSwapTarget(targetPlayer);
    setSwapImpact(impact);
    setShowSwapModal(true);
  };

  const handleConfirmSwap = () => {
    if (!swapTarget || !currentUser.role || !swapTarget.role) return;
    
    requestSwap(
      swapTarget.id,
      currentUser.role,
      swapTarget.role,
      swapImpact
    );
    
    setShowSwapModal(false);
    setSwapTarget(null);
    setSwapImpact(null);
    
    Taro.showToast({
      title: '换角请求已发送',
      icon: 'success'
    });
  };

  const isHost = currentRoom.players.find(p => p.id === currentUser.id)?.isHost || false;
  const canMatch = isHost && currentRoom.status === 'waiting' && currentRoom.players.length >= 2;
  const allMatched = currentRoom.status === 'matched';

  return (
    <>
      <ScrollView className={styles.page} scrollY>
        <View className={styles.roomHeader}>
          <View className={styles.roomInfoCard}>
            <Text className={styles.scriptName}>📜 {currentRoom.scriptName}</Text>
            <View className={styles.roomCodeRow}>
              <Text className={styles.roomCode}>{currentRoom.code}</Text>
              <Button className={styles.copyBtn} onClick={handleCopyCode}>
                复制
              </Button>
            </View>
            <View className={styles.roomMeta}>
              <View className={styles.metaItem}>
                <Text className={styles.metaValue}>{currentRoom.players.length}/{currentRoom.roleCount}</Text>
                <Text className={styles.metaLabel}>玩家</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaValue}>
                  {currentRoom.status === 'waiting' ? '⏳' : currentRoom.status === 'matching' ? '🎲' : '✅'}
                </Text>
                <Text className={styles.metaLabel}>
                  {currentRoom.status === 'waiting' ? '等待中' : currentRoom.status === 'matching' ? '匹配中' : '已匹配'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            👥 玩家列表 ({currentRoom.players.length}/{currentRoom.roleCount})
          </Text>
          
          {!allMatched && currentRoom.players.some(p => !p.profile) && (
            <View className={styles.unmatchedTip}>
              <Text className={styles.unmatchedTipText}>
                ⚠️ 有玩家未完成测试，建议先完成测试获得更佳匹配效果
              </Text>
            </View>
          )}

          <View className={styles.playerList}>
            {currentRoom.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                showRole={allMatched}
                showPrefs={true}
                isSwapTarget={allMatched && showSwapModal && swapTarget?.id === player.id}
                onClick={() => allMatched && player.id !== currentUser.id && handleInitiateSwap(player)}
              />
            ))}
          </View>
        </View>

        {allMatched && matchResult && (
          <View className={styles.matchResultSection}>
            <View className={styles.matchResultCard}>
              <Text className={styles.matchResultTitle}>🎯 分角结果</Text>
              <Text className={styles.matchResultDesc}>{matchResult.overallReason}</Text>
              
              <View className={styles.roleAssignments}>
                {matchResult.suggestions.map((suggestion) => {
                  const player = currentRoom.players.find(p => p.id === suggestion.playerId);
                  if (!player) return null;
                  
                  return (
                    <RoleCard
                      key={suggestion.playerId}
                      player={player}
                      role={suggestion.role}
                      reason={suggestion.reason}
                      score={suggestion.score}
                      showSwap={player.id !== currentUser.id}
                      onSwap={() => handleInitiateSwap(player)}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View className={styles.actionButtons}>
        <Button
          className={classnames(styles.actionBtn, styles.secondary)}
          onClick={handleLeaveRoom}
        >
          离开房间
        </Button>
        {canMatch && (
          <Button
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={handleStartMatching}
          >
            开始匹配 🎲
          </Button>
        )}
        {allMatched && (
          <Button
            className={classnames(styles.actionBtn, styles.success)}
            onClick={() => {
              updateRoomStatus('playing');
              Taro.showToast({ title: '游戏开始！祝大家玩得开心~', icon: 'success' });
            }}
          >
            开始游戏 🎮
          </Button>
        )}
      </View>

      {showSwapModal && swapTarget && swapImpact && (
        <View className={styles.swapModal} onClick={() => setShowSwapModal(false)}>
          <View className={styles.swapModalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.swapModalTitle}>🔄 发起换角</Text>
            
            <View className={styles.swapPlayers}>
              <View className={styles.swapPlayer}>
                <Image className={styles.swapAvatar} src={currentUser.avatar} mode="aspectFill" />
                <Text className={styles.swapRole}>{currentUser.role}</Text>
                <Text className={styles.swapName}>{currentUser.name}</Text>
              </View>
              <Text className={styles.swapArrow}>⇄</Text>
              <View className={styles.swapPlayer}>
                <Image className={styles.swapAvatar} src={swapTarget.avatar} mode="aspectFill" />
                <Text className={styles.swapRole}>{swapTarget.role}</Text>
                <Text className={styles.swapName}>{swapTarget.name}</Text>
              </View>
            </View>

            <View className={styles.impactSection}>
              <View className={styles.impactItem}>
                <Text className={styles.impactLabel}>对你的影响：</Text>
                <Text className={classnames(
                  styles.impactText,
                  swapImpact.fromPlayer.includes('更') && styles.impactGood,
                  swapImpact.fromPlayer.includes('下降') && styles.impactBad
                )}>
                  {swapImpact.fromPlayer}
                </Text>
              </View>
              <View className={styles.impactItem}>
                <Text className={styles.impactLabel}>对对方的影响：</Text>
                <Text className={classnames(
                  styles.impactText,
                  swapImpact.toPlayer.includes('更') && styles.impactGood,
                  swapImpact.toPlayer.includes('别扭') && styles.impactBad
                )}>
                  {swapImpact.toPlayer}
                </Text>
              </View>
              <View className={styles.impactItem}>
                <Text className={styles.impactLabel}>整体影响：</Text>
                <Text className={classnames(
                  styles.impactText,
                  swapImpact.overall.includes('双赢') && styles.impactGood,
                  swapImpact.overall.includes('血亏') && styles.impactBad
                )}>
                  {swapImpact.overall}
                </Text>
              </View>
            </View>

            <View className={styles.swapModalButtons}>
              <Button
                className={classnames(styles.swapModalBtn, styles.cancel)}
                onClick={() => setShowSwapModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.swapModalBtn, styles.confirm)}
                onClick={handleConfirmSwap}
              >
                确认发送
              </Button>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default RoomDetailPage;
