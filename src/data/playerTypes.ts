import { PlayerTypeInfo, PlayerType } from '@/types';

export const playerTypes: Record<PlayerType, PlayerTypeInfo> = {
  detective: {
    type: 'detective',
    name: '控场侦探型',
    emoji: '🔍',
    color: '#60A5FA',
    description: '天生的领导者，喜欢掌控节奏，逻辑推理能力强，擅长从混乱中找出真相。',
    traits: ['逻辑控', '爱带节奏', '直觉准', '喜欢盘问', '享受掌控']
  },
  emotional: {
    type: 'emotional',
    name: '情感爆发型',
    emoji: '🎭',
    color: '#F472B6',
    description: '共情能力满分，沉浸角色的戏精本精，哭戏说来就来，是氛围组的核心担当。',
    traits: ['戏精', '共情强', '爱哭包', '代入快', '感情用事']
  },
  observer: {
    type: 'observer',
    name: '暗线观察型',
    emoji: '👁️',
    color: '#34D399',
    description: '人群中的隐形人，默默记下所有细节，看似边缘实则掌握关键信息，适合有秘密的角色。',
    traits: ['记忆力好', '细心', '耐得住寂寞', '藏得住事', '阅读快']
  },
  icebreaker: {
    type: 'icebreaker',
    name: '欢乐破冰型',
    emoji: '🎉',
    color: '#FBBF24',
    description: '冷场终结者，有你在就不会尴尬，擅长用幽默化解紧张气氛，是团队的开心果。',
    traits: ['段子手', '社牛', '会接梗', '爱搞事', '乐观派']
  }
};

export const getTypeInfo = (type: PlayerType): PlayerTypeInfo => {
  return playerTypes[type];
};
