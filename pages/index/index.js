// pages/index/index.js
Page({
  data: {
    // 页面数据
  },
  
  onLoad: function () {
    // 页面加载时的逻辑
  },
  
  // 跳转到任务页面
  goToTasks: function() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    })
  }
})