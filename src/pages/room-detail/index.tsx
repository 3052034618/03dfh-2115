import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { assignRoles, calculateSwapImpact } from '@/utils/roleAssigner';
import { Player, MatchResult, SwapRequest, SwapImpact } from '@/types';
import PlayerCard from '@/components/PlayerCard';
import RoleCard from '@/components/RoleCard';
import styles from './index.module.scss';

const RoomDetailPage: React.FC = () => {
  const {
    currentRoom,
    currentUser,
    leaveRoom,
    updateRoomStatus,
    setAssignedRoles,
    requestSwap,
    respondToSwap,
    addPlayerToRoom,
    hasPendingSwapBetween
  } = useAppStore();

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTarget, setSwapTarget] = useState<Player | null>(null);
  const [swapImpact, setSwapImpact] = useState<SwapImpact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [currentRoom?.id, addPlayerToRoom, currentRoom?.players.length, currentRoom?.roleCount, currentRoom]);

  useEffect(() => {
    if (currentRoom?.status === 'matched' && currentRoom.assignedRoles) {
      const result = assignRoles(currentRoom.players, currentRoom.roleCount);
      result.suggestions = result.suggestions.map(sug => {
        const player = currentRoom.players.find(p => p.id === sug.playerId);
        if (player?.role) {
          return { ...sug, role: player.role };
        }
        return sug;
      });
      setMatchResult(result);
      console.log('[RoomDetail] 分角结果已刷新，角色数:', result.suggestions.length);
    } else if (currentRoom?.status === 'playing' && currentRoom.assignedRoles && !matchResult) {
      const result = assignRoles(currentRoom.players, currentRoom.roleCount);
      result.suggestions = result.suggestions.map(sug => {
        const player = currentRoom.players.find(p => p.id === sug.playerId);
        if (player?.role) {
          return { ...sug, role: player.role };
        }
        return sug;
      });
      setMatchResult(result);
    }
  }, [currentRoom?.status, currentRoom?.assignedRoles, currentRoom?.players, currentRoom, matchResult]);

  const pendingSwaps = useMemo(() => {
    if (!currentRoom || !currentUser) return { sent: [], received: [] as SwapRequest[] };
    const allPending = currentRoom.swapRequests.filter(r => r.status === 'pending');
    return {
      sent: allPending.filter(r => r.fromPlayerId === currentUser.id),
      received: allPending.filter(r => r.toPlayerId === currentUser.id)
    };
  }, [currentRoom, currentUser]);

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
    console.log('[RoomDetail] 点击发起换角，target:', targetPlayer.name, 'target.role:', targetPlayer.role, 'currentUser.role:', currentUser.role);
    
    if (!currentUser.role || !targetPlayer.role) {
      console.log('[RoomDetail] 角色为空，取消操作');
      Taro.showToast({ title: '角色信息不完整', icon: 'none' });
      return;
    }
    
    if (hasPendingSwapBetween(currentUser.id, targetPlayer.id)) {
      Taro.showToast({ title: '与该玩家已有待处理请求', icon: 'none' });
      return;
    }

    setIsLoading(true);

    try {
      const impact = calculateSwapImpact(
        currentUser,
        targetPlayer,
        currentUser.role,
        targetPlayer.role
      );
      
      console.log('[RoomDetail] 换角影响计算完成:', impact);

      setSwapTarget(targetPlayer);
      setSwapImpact(impact);
      setShowSwapModal(true);
    } catch (err) {
      console.error('[Swap] 计算换角影响失败:', err);
      Taro.showToast({ title: '计算失败，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSwap = () => {
    if (!swapTarget || !currentUser.role || !swapTarget.role || !swapImpact) return;

    const result = requestSwap(
      swapTarget.id,
      currentUser.role,
      swapTarget.role,
      swapImpact
    );

    if (result) {
      setShowSwapModal(false);
      setSwapTarget(null);
      setSwapImpact(null);
      Taro.showToast({
        title: '换角请求已发送，等待对方回应~',
        icon: 'success',
        duration: 2000
      });
    }
  };

  const handleRespondSwap = (requestId: string, accepted: boolean) => {
    const req = currentRoom.swapRequests.find(r => r.id === requestId);
    if (!req) return;

    Taro.showModal({
      title: accepted ? '确认接受换角？' : '确认拒绝换角？',
      content: accepted
        ? `你将与 ${currentRoom.players.find(p => p.id === req.fromPlayerId)?.name || '对方'} 交换角色`
        : '拒绝后无法恢复，确定吗？',
      success: (res) => {
        if (res.confirm) {
          respondToSwap(requestId, accepted);
          Taro.showToast({
            title: accepted ? '已接受换角！角色已更新' : '已拒绝换角请求',
            icon: 'success'
          });
        }
      }
    });
  };

  const getPlayerById = (id: string): Player | undefined => {
    return currentRoom.players.find(p => p.id === id);
  };

  const getTrendClass = (diff: number): string => {
    if (diff > 1) return styles.impactGood;
    if (diff < -1) return styles.impactBad;
    return styles.impactNeutral;
  };

  const isHost = currentRoom.players.find(p => p.id === currentUser.id)?.isHost || false;
  const canMatch = isHost && currentRoom.status === 'waiting' && currentRoom.players.length >= 2;
  const allMatched = currentRoom.status === 'matched' || currentRoom.status === 'playing';

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
                  {currentRoom.status === 'waiting' ? '⏳' : currentRoom.status === 'matching' ? '🎲' : currentRoom.status === 'matched' ? '✅' : '🎮'}
                </Text>
                <Text className={styles.metaLabel}>
                  {currentRoom.status === 'waiting' ? '等待中' : currentRoom.status === 'matching' ? '匹配中' : currentRoom.status === 'matched' ? '已匹配' : '游戏中'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {pendingSwaps.sent.length > 0 && allMatched && (
          <View className={styles.swapNoticeSection}>
            <Text className={styles.noticeTitle}>📤 我发出的换角请求</Text>
            {pendingSwaps.sent.map(req => {
              const target = getPlayerById(req.toPlayerId);
              return (
                <View key={req.id} className={styles.swapNoticeCard}>
                  <Text className={styles.swapNoticeText}>
                    请求与 {target?.name || '对方'} 交换：{req.fromRole} ⇄ {req.toRole}
                  </Text>
                  <View className={styles.pendingBadge}>⏳ 等待对方处理</View>
                </View>
              );
            })}
          </View>
        )}

        {pendingSwaps.received.length > 0 && allMatched && (
          <View className={styles.swapNoticeSection}>
            <Text className={styles.noticeTitle}>📥 发给我的换角请求（需要你处理）</Text>
            {pendingSwaps.received.map(req => {
              const requester = getPlayerById(req.fromPlayerId);
              return (
                <View key={req.id} className={styles.swapNoticeCard}>
                  <View style={{ flex: 1 }}>
                    <Text className={styles.swapNoticeText}>
                      {requester?.name || '有人'} 想与你交换：{req.toRole} ⇄ {req.fromRole}
                    </Text>
                    <View className={styles.impactMini}>
                      <Text className={classnames(styles.impactMiniText, getTrendClass(req.impact.toDiff))}>
                        你：{req.impact.toDiff >= 0 ? '+' : ''}{req.impact.toDiff.toFixed(1)}分
                      </Text>
                    </View>
                  </View>
                  <View className={styles.swapResponseBtns}>
                    <Button
                      className={classnames(styles.responseBtn, styles.rejectBtn)}
                      onClick={() => handleRespondSwap(req.id, false)}
                    >
                      拒绝
                    </Button>
                    <Button
                      className={classnames(styles.responseBtn, styles.acceptBtn)}
                      onClick={() => handleRespondSwap(req.id, true)}
                    >
                      接受
                    </Button>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
            {currentRoom.players.map((player) => {
              const hasPending = currentUser
                ? hasPendingSwapBetween(currentUser.id, player.id)
                : false;
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  showRole={allMatched}
                  showPrefs={true}
                  isSwapTarget={allMatched && showSwapModal && swapTarget?.id === player.id}
                  hasPendingSwap={hasPending && player.id !== currentUser.id}
                  onClick={() => allMatched && player.id !== currentUser.id && handleInitiateSwap(player)}
                />
              );
            })}
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
                  const hasPending = currentUser
                    ? hasPendingSwapBetween(currentUser.id, player.id)
                    : false;
                  const effectiveRole = player.role || suggestion.role;

                  return (
                    <RoleCard
                      key={suggestion.playerId}
                      player={player}
                      role={effectiveRole}
                      reason={suggestion.reason}
                      score={suggestion.score}
                      showSwap={allMatched && player.id !== currentUser.id && currentRoom.status === 'matched'}
                      swapDisabled={hasPending}
                      onSwap={() => handleInitiateSwap(player)}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {allMatched && currentRoom.swapRequests.filter(r => r.status !== 'pending').length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🔄 换角记录</Text>
            {currentRoom.swapRequests
              .filter(r => r.status !== 'pending')
              .map(req => {
                const from = getPlayerById(req.fromPlayerId);
                const to = getPlayerById(req.toPlayerId);
                return (
                  <View key={req.id} className={styles.swapHistoryCard}>
                    <Text>
                      {from?.name} ⇄ {to?.name}：{req.fromRole} ⇄ {req.toRole}
                    </Text>
                    <Text className={classnames(
                      req.status === 'accepted' ? styles.historyAccept : styles.historyReject
                    )}>
                      {req.status === 'accepted' ? '✅ 已完成' : '❌ 已拒绝'}
                    </Text>
                  </View>
                );
              })}
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
        {allMatched && currentRoom.status === 'matched' && isHost && (
          <Button
            className={classnames(styles.actionBtn, styles.success)}
            onClick={() => {
              if (pendingSwaps.sent.length > 0 || pendingSwaps.received.length > 0) {
                Taro.showModal({
                  title: '有待处理的换角请求',
                  content: '还有换角请求未处理，确定要开始游戏吗？',
                  success: (res) => {
                    if (res.confirm) {
                      updateRoomStatus('playing');
                      Taro.showToast({ title: '游戏开始！祝大家玩得开心~', icon: 'success' });
                    }
                  }
                });
              } else {
                updateRoomStatus('playing');
                Taro.showToast({ title: '游戏开始！祝大家玩得开心~', icon: 'success' });
              }
            }}
          >
            开始游戏 🎮
          </Button>
        )}
        {currentRoom.status === 'playing' && (
          <View className={classnames(styles.actionBtn, styles.playingHint)}>
            🎭 游戏进行中...
          </View>
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
                <Text className={styles.swapName}>{currentUser.name}（你）</Text>
                <View className={classnames(styles.swapDiffBadge, getTrendClass(swapImpact.fromDiff))}>
                  {swapImpact.fromDiff >= 0 ? '+' : ''}{swapImpact.fromDiff.toFixed(1)}
                </View>
              </View>
              <Text className={styles.swapArrow}>⇄</Text>
              <View className={styles.swapPlayer}>
                <Image className={styles.swapAvatar} src={swapTarget.avatar} mode="aspectFill" />
                <Text className={styles.swapRole}>{swapTarget.role}</Text>
                <Text className={styles.swapName}>{swapTarget.name}</Text>
                <View className={classnames(styles.swapDiffBadge, getTrendClass(swapImpact.toDiff))}>
                  {swapImpact.toDiff >= 0 ? '+' : ''}{swapImpact.toDiff.toFixed(1)}
                </View>
              </View>
            </View>

            <View className={styles.impactSection}>
              <View className={styles.impactItem}>
                <Text className={styles.impactLabel}>对你的影响：</Text>
                <Text className={classnames(
                  styles.impactText,
                  getTrendClass(swapImpact.fromDiff)
                )}>
                  {swapImpact.fromPlayer}
                </Text>
              </View>
              <View className={styles.impactItem}>
                <Text className={styles.impactLabel}>对对方的影响：</Text>
                <Text className={classnames(
                  styles.impactText,
                  getTrendClass(swapImpact.toDiff)
                )}>
                  {swapImpact.toPlayer}
                </Text>
              </View>
              <View className={styles.impactItem}>
                <Text className={styles.impactLabel}>整体影响：</Text>
                <Text className={classnames(
                  styles.impactText,
                  getTrendClass(swapImpact.overallDiff)
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
                loading={isLoading}
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
