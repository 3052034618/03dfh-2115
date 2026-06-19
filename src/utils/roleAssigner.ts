import { Player, PlayerType, MatchResult, RoleSuggestion, SwapRequest } from '@/types';
import { getTypeInfo } from '@/data/playerTypes';

interface RoleMeta {
  name: string;
  requiresLeadership: number;
  requiresEmotion: number;
  requiresObservation: number;
  requiresHumor: number;
  hasSecret: boolean;
}

const roleTemplates: Record<string, RoleMeta> = {
  '侦探': { name: '侦探', requiresLeadership: 5, requiresEmotion: 2, requiresObservation: 4, requiresHumor: 2, hasSecret: false },
  '凶手': { name: '凶手', requiresLeadership: 3, requiresEmotion: 3, requiresObservation: 5, requiresHumor: 2, hasSecret: true },
  '恋人': { name: '恋人', requiresLeadership: 1, requiresEmotion: 5, requiresObservation: 2, requiresHumor: 1, hasSecret: true },
  '朋友': { name: '朋友', requiresLeadership: 2, requiresEmotion: 3, requiresObservation: 3, requiresHumor: 3, hasSecret: true },
  '管家': { name: '管家', requiresLeadership: 2, requiresEmotion: 2, requiresObservation: 5, requiresHumor: 1, hasSecret: true },
  '医生': { name: '医生', requiresLeadership: 3, requiresEmotion: 2, requiresObservation: 4, requiresHumor: 2, hasSecret: true },
  '作家': { name: '作家', requiresLeadership: 2, requiresEmotion: 4, requiresObservation: 4, requiresHumor: 3, hasSecret: true },
  '学生': { name: '学生', requiresLeadership: 1, requiresEmotion: 3, requiresObservation: 3, requiresHumor: 4, hasSecret: true },
  '富二代': { name: '富二代', requiresLeadership: 4, requiresEmotion: 3, requiresObservation: 2, requiresHumor: 3, hasSecret: true },
  '警察': { name: '警察', requiresLeadership: 5, requiresEmotion: 2, requiresObservation: 4, requiresHumor: 1, hasSecret: false }
};

const getTypeScore = (playerType: PlayerType, role: RoleMeta): number => {
  const typeWeights: Record<PlayerType, number[]> = {
    detective: [role.requiresLeadership, role.requiresObservation, role.requiresEmotion * 0.5, role.requiresHumor * 0.5],
    emotional: [role.requiresEmotion, role.requiresLeadership * 0.5, role.requiresObservation * 0.7, role.requiresHumor * 0.8],
    observer: [role.requiresObservation, role.hasSecret ? 5 : 2, role.requiresEmotion * 0.5, role.requiresLeadership * 0.4],
    icebreaker: [role.requiresHumor, role.requiresEmotion * 0.8, role.requiresLeadership * 0.5, role.requiresObservation * 0.3]
  };
  
  const weights = typeWeights[playerType];
  return weights.reduce((sum, w) => sum + w, 0);
};

const funnyReasons = [
  '天生的角色适配度高达99.9%，不选你选谁！',
  '系统掐指一算，这个角色简直是为你量身定做的',
  '经过精密计算，你和这个角色的匹配度可以凑成CP了',
  '你的隐藏属性完美触发了这个角色的剧情线',
  '大数据显示，你玩这个角色胜率提升300%',
  '放心，这个角色不会让你背锅的...大概吧',
  '你的戏精属性已经按捺不住了，就是你了！',
  '这个角色需要你的特殊技能，来吧少年！'
];

export const assignRoles = (players: Player[], roleCount: number): MatchResult => {
  const roleNames = Object.keys(roleTemplates).slice(0, roleCount);
  const usedRoles = new Set<string>();
  const suggestions: RoleSuggestion[] = [];

  const playersWithProfile = players.filter(p => p.profile !== null);
  
  playersWithProfile.forEach((player) => {
    let bestRole = '';
    let bestScore = -1;
    
    roleNames.forEach((roleName) => {
      if (usedRoles.has(roleName)) return;
      
      const role = roleTemplates[roleName];
      const score = getTypeScore(player.profile!.type, role);
      
      if (score > bestScore) {
        bestScore = score;
        bestRole = roleName;
      }
    });

    if (bestRole) {
      usedRoles.add(bestRole);
      suggestions.push({
        playerId: player.id,
        role: bestRole,
        reason: funnyReasons[Math.floor(Math.random() * funnyReasons.length)],
        score: Math.min(100, bestScore * 5 + Math.random() * 20)
      });
    }
  });

  players.filter(p => p.profile === null).forEach((player) => {
    const remainingRole = roleNames.find(r => !usedRoles.has(r));
    if (remainingRole) {
      usedRoles.add(remainingRole);
      suggestions.push({
        playerId: player.id,
        role: remainingRole,
        reason: '还没测性格？先给你安排个神秘角色，快去测测吧！',
        score: 70 + Math.random() * 10
      });
    }
  });

  const overallReasons = [
    '经过系统精密运算，本次分配兼顾了逻辑推理与情感体验，祝大家玩得开心！',
    '系统已为各位天选之子安排好命运，接下来请开始你们的表演！',
    '匹配完成！这个组合的化学反应指数高达98%，期待精彩发挥！',
    '分配结果已出，谁是天眼谁是凶手，就看各位的演技了！'
  ];

  return {
    suggestions,
    overallReason: overallReasons[Math.floor(Math.random() * overallReasons.length)]
  };
};

export const calculateSwapImpact = (
  fromPlayer: Player,
  toPlayer: Player,
  fromRole: string,
  toRole: string
): {
  fromPlayer: string;
  toPlayer: string;
  overall: string;
  fromDiff: number;
  toDiff: number;
  overallDiff: number;
} => {
  if (!fromPlayer.profile || !toPlayer.profile) {
    return {
      fromPlayer: '还未完成测试，无法评估影响',
      toPlayer: '还未完成测试，无法评估影响',
      overall: '建议双方先完成性格测试哦',
      fromDiff: 0,
      toDiff: 0,
      overallDiff: 0
    };
  }

  const fromMeta = roleTemplates[fromRole] || roleTemplates['侦探'];
  const toMeta = roleTemplates[toRole] || roleTemplates['侦探'];

  const fromScoreOld = getTypeScore(fromPlayer.profile.type, fromMeta);
  const fromScoreNew = getTypeScore(fromPlayer.profile.type, toMeta);
  const toScoreOld = getTypeScore(toPlayer.profile.type, toMeta);
  const toScoreNew = getTypeScore(toPlayer.profile.type, fromMeta);

  const fromDiff = fromScoreNew - fromScoreOld;
  const toDiff = toScoreNew - toScoreOld;
  const overallDiff = fromDiff + toDiff;

  const formatTrend = (diff: number): string => {
    if (diff > 5) return '↑ 大幅提升';
    if (diff > 1) return '↗ 小幅提升';
    if (diff >= -1) return '→ 基本持平';
    if (diff >= -5) return '↘ 小幅下降';
    return '↓ 明显下降';
  };

  const generateImpactText = (diff: number, isRequester: boolean): string => {
    const trend = formatTrend(diff);
    const prefix = isRequester ? '你：' : '对方：';
    const diffText = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
    
    if (isRequester) {
      if (diff > 5) return `${trend}，体验感${diffText}分！这个角色更对你胃口~`;
      if (diff > 1) return `${trend}，体验感${diffText}分，还不错哦`;
      if (diff >= -1) return `${trend}，体验感${diffText}分，影响不大`;
      if (diff >= -5) return `${trend}，体验感${diffText}分，可能需要适应一下`;
      return `${trend}，体验感${diffText}分，这个角色可能不太适合你...`;
    } else {
      if (diff > 5) return `${trend}，体验感${diffText}分！对方也很适合这个角色`;
      if (diff > 1) return `${trend}，体验感${diffText}分，体验不错`;
      if (diff >= -1) return `${trend}，体验感${diffText}分，基本没差`;
      if (diff >= -5) return `${trend}，体验感${diffText}分，对方可能需要适应`;
      return `${trend}，体验感${diffText}分，对方可能会玩得有点别扭`;
    }
  };

  let overall = '';
  if (overallDiff > 8) overall = '🎉 双赢局面！双方体验都会提升，强烈建议交换！';
  else if (overallDiff > 3) overall = '👍 对整体体验有提升，可以考虑交换';
  else if (overallDiff > -3) overall = '🤷 影响不大，看你们自己的意愿啦';
  else if (overallDiff > -8) overall = '⚠️ 可能会降低整体体验，建议三思';
  else overall = '💔 这波交换血亏，建议慎重考虑！';

  return {
    fromPlayer: generateImpactText(fromDiff, true),
    toPlayer: generateImpactText(toDiff, false),
    overall,
    fromDiff,
    toDiff,
    overallDiff
  };
};

export const generateMockRoles = (count: number): string[] => {
  return Object.keys(roleTemplates).slice(0, count);
};
