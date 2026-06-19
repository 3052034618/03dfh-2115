export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/quiz/index',
    'pages/room/index',
    'pages/profile/index',
    'pages/room-detail/index',
    'pages/quiz-result/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0F172A',
    navigationBarTitleText: '拼车分角助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0F172A'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#6366F1',
    backgroundColor: '#0F172A',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/quiz/index',
        text: '测试'
      },
      {
        pagePath: 'pages/room/index',
        text: '房间'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
