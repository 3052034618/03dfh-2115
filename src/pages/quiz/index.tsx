import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { quizQuestions } from '@/data/quizQuestions';
import { calculateScores, generateProfile, determinePlayerType } from '@/utils/profileMatcher';
import { getTypeInfo } from '@/data/playerTypes';
import { PlayerType } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import QuizQuestion from '@/components/QuizQuestion';
import TypeTag from '@/components/TypeTag';
import styles from './index.module.scss';

const QuizPage: React.FC = () => {
  const { currentUser, updateUserProfile, currentRoom } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (currentUser?.profile && Object.keys(answers).length === 0) {
      setShowResult(true);
    }
  }, [currentUser, answers]);

  const handleStart = () => {
    setShowIntro(false);
    setShowResult(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleSelectOption = (optionIndex: number) => {
    const questionId = quizQuestions[currentQuestion].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const scores = calculateScores(answers);
    const profile = generateProfile(scores, answers);
    updateUserProfile(profile);
    setShowResult(true);
    console.log('[Quiz] 测试完成，生成画像:', profile.name);

    Taro.showToast({
      title: '测试完成！',
      icon: 'success',
      duration: 2000
    });
  };

  const handleViewResult = () => {
    Taro.navigateTo({ url: '/pages/quiz-result/index' });
  };

  const handleBackToRoom = () => {
    if (currentRoom) {
      Taro.navigateTo({ url: '/pages/room-detail/index' });
    } else {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  };

  const currentScores = Object.keys(answers).length > 0 ? calculateScores(answers) : null;

  if (showIntro) {
    return (
      <View className={styles.page}>
        <View className={styles.introSection}>
          <Text className={styles.introIcon}>🎭</Text>
          <Text className={styles.introTitle}>剧本杀性格测试</Text>
          <Text className={styles.introDesc}>
            回答几个简单的问题，{'\n'}
            发现你最适合的剧本角色类型！{'\n\n'}
            只需 1 分钟，让分角更科学，{'\n'}
            再也不用担心抢不到心仪的角色啦~
          </Text>
        </View>

        <View style={{ marginBottom: '32rpx' }}>
          <TypeTag type="detective" size="lg" />
          <View style={{ height: '16rpx' }} />
          <TypeTag type="emotional" size="lg" />
          <View style={{ height: '16rpx' }} />
          <TypeTag type="observer" size="lg" />
          <View style={{ height: '16rpx' }} />
          <TypeTag type="icebreaker" size="lg" />
        </View>

        <Button
          className={styles.retakeBtn}
          onClick={handleStart}
        >
          开始测试 🚀
        </Button>

        {currentUser?.profile && (
          <View style={{ marginTop: '32rpx', textAlign: 'center' }}>
            <Text
              style={{ color: '#94A3B8', fontSize: '28rpx', textDecoration: 'underline' }}
              onClick={handleViewResult}
            >
              查看上次测试结果 →
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (showResult && currentUser?.profile) {
    const typeInfo = getTypeInfo(currentUser.profile.type);
    return (
      <View className={styles.page}>
        <View className={styles.retakeSection}>
          <Text className={styles.retakeIcon}>{typeInfo.emoji}</Text>
          <Text className={styles.retakeTitle}>你的玩家类型是...</Text>
          <TypeTag type={currentUser.profile.type} size="lg" />
          <Text className={styles.retakeDesc}>
            {typeInfo.description}
          </Text>

          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx', justifyContent: 'center', marginBottom: '48rpx' }}>
            {typeInfo.traits.map((trait, i) => (
              <View key={i} style={{
                background: `${typeInfo.color}20`,
                padding: '8rpx 20rpx',
                borderRadius: '24rpx'
              }}>
                <Text style={{ color: typeInfo.color, fontSize: '24rpx', fontWeight: '500' }}>
                  {trait}
                </Text>
              </View>
            ))}
          </View>

          <Button
            className={styles.retakeBtn}
            onClick={handleViewResult}
            style={{ marginBottom: '24rpx' }}
          >
            查看详细解读 📖
          </Button>

          <Button
            className={styles.retakeBtn}
            onClick={handleStart}
            style={{
              background: '#334155',
              marginBottom: '24rpx'
            }}
          >
            重新测试 🔄
          </Button>

          {currentRoom && (
            <Button
              className={styles.retakeBtn}
              onClick={handleBackToRoom}
              style={{
                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
              }}
            >
              返回房间 🏠
            </Button>
          )}
        </View>
      </View>
    );
  }

  const question = quizQuestions[currentQuestion];
  const selectedOption = answers[question.id] ?? null;

  return (
    <View className={styles.page}>
      <View className={styles.progressSection}>
        <ProgressBar
          current={currentQuestion + 1}
          total={quizQuestions.length}
        />
      </View>

      <View className={styles.quizSection}>
        <QuizQuestion
          question={question}
          selectedOption={selectedOption}
          onSelect={handleSelectOption}
        />
      </View>

      {currentScores && (
        <View className={styles.typePreview}>
          {(Object.keys(currentScores) as PlayerType[]).map(type => {
            const info = getTypeInfo(type);
            return (
              <View
                key={type}
                className={styles.typePreviewItem}
                style={{
                  background: `${info.color}15`,
                  border: determinePlayerType(currentScores) === type ? `2rpx solid ${info.color}` : '2rpx solid transparent'
                }}
              >
                <Text className={styles.typePreviewIcon}>{info.emoji}</Text>
                <Text className={styles.typePreviewName}>{info.name.slice(0, 4)}</Text>
                <Text
                  className={styles.typePreviewScore}
                  style={{ color: info.color }}
                >
                  {currentScores[type]}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.navButtons}>
        {currentQuestion > 0 && (
          <Button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
          >
            上一题
          </Button>
        )}
        <Button
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={handleNext}
          disabled={selectedOption === null}
        >
          {currentQuestion === quizQuestions.length - 1 ? '完成测试' : '下一题'}
        </Button>
      </View>
    </View>
  );
};

export default QuizPage;
