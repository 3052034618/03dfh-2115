import { QuizQuestion } from '@/types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: '打本时，你更倾向于？',
    options: [
      {
        text: '掌控全场节奏，带着大家盘逻辑',
        scores: { detective: 5, emotional: 1, observer: 2, icebreaker: 3 }
      },
      {
        text: '完全沉浸角色，该哭就哭该笑就笑',
        scores: { detective: 1, emotional: 5, observer: 2, icebreaker: 2 }
      },
      {
        text: '默默观察每个人，记下可疑的细节',
        scores: { detective: 2, emotional: 1, observer: 5, icebreaker: 1 }
      },
      {
        text: '活跃气氛，讲讲段子让大家放松',
        scores: { detective: 1, emotional: 2, observer: 1, icebreaker: 5 }
      }
    ]
  },
  {
    id: 2,
    question: '如果抽到的角色需要背锅，你能接受吗？',
    options: [
      {
        text: '完全可以，为了游戏体验牺牲一下算什么',
        scores: { detective: 3, emotional: 4, observer: 5, icebreaker: 4 }
      },
      {
        text: '看情况，实在不行就甩锅',
        scores: { detective: 5, emotional: 2, observer: 4, icebreaker: 3 }
      },
      {
        text: '有点难，我会忍不住解释清楚',
        scores: { detective: 2, emotional: 3, observer: 1, icebreaker: 2 }
      },
      {
        text: '绝对不行！我要清清白白！',
        scores: { detective: 1, emotional: 1, observer: 0, icebreaker: 1 }
      }
    ]
  },
  {
    id: 3,
    question: '遇到陌生玩家，你会主动去盘问TA吗？',
    options: [
      {
        text: '必须的！我第一个冲上去问',
        scores: { detective: 5, emotional: 2, observer: 2, icebreaker: 4 }
      },
      {
        text: '看对方好不好说话再说',
        scores: { detective: 3, emotional: 3, observer: 3, icebreaker: 3 }
      },
      {
        text: '不会主动，但会观察TA的反应',
        scores: { detective: 2, emotional: 2, observer: 5, icebreaker: 2 }
      },
      {
        text: '社恐表示先看看别人怎么问',
        scores: { detective: 1, emotional: 1, observer: 2, icebreaker: 1 }
      }
    ]
  },
  {
    id: 4,
    question: '你的阅读速度怎么样？',
    options: [
      {
        text: '一目十行，扫完就能记住重点',
        scores: { detective: 4, emotional: 2, observer: 5, icebreaker: 3 }
      },
      {
        text: '中等速度，保证理解每个细节',
        scores: { detective: 3, emotional: 4, observer: 4, icebreaker: 3 }
      },
      {
        text: '比较慢，喜欢逐字逐句品',
        scores: { detective: 2, emotional: 5, observer: 2, icebreaker: 2 }
      },
      {
        text: '看到长文就头疼...',
        scores: { detective: 1, emotional: 1, observer: 1, icebreaker: 2 }
      }
    ]
  },
  {
    id: 5,
    question: '如果发现自己可能是凶手，你会？',
    options: [
      {
        text: '冷静分析，编造完美不在场证明',
        scores: { detective: 5, emotional: 2, observer: 4, icebreaker: 3 }
      },
      {
        text: '努力入戏，用演技骗过所有人',
        scores: { detective: 2, emotional: 5, observer: 3, icebreaker: 3 }
      },
      {
        text: '默默藏好线索，静观其变',
        scores: { detective: 3, emotional: 2, observer: 5, icebreaker: 2 }
      },
      {
        text: '开玩笑转移注意力，混过去再说',
        scores: { detective: 2, emotional: 2, observer: 2, icebreaker: 5 }
      }
    ]
  },
  {
    id: 6,
    question: '你更看重剧本的什么？',
    options: [
      {
        text: '精彩的诡计和烧脑的推理',
        scores: { detective: 5, emotional: 1, observer: 4, icebreaker: 2 }
      },
      {
        text: '动人的故事和立体的人物',
        scores: { detective: 1, emotional: 5, observer: 3, icebreaker: 2 }
      },
      {
        text: '巧妙的伏笔和反转',
        scores: { detective: 4, emotional: 2, observer: 5, icebreaker: 2 }
      },
      {
        text: '轻松欢乐，大家玩得开心就好',
        scores: { detective: 1, emotional: 2, observer: 1, icebreaker: 5 }
      }
    ]
  }
];
