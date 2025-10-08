// pages/stats/stats.js
Page({
  data: {
    completedTasksCount: 0, // 完成的任务数量
    totalFragments: 0, // 获得的碎片总数
    exchangedRewardsCount: 0, // 兑换的奖励数量
    learningRecords: [], // 学习记录
    recentTasks: [], // 最近完成的任务
    chartData: null // 图表数据
  },

  onLoad: function() {
    // 初始化数据
    this.updateStatsData();
  },

  onShow: function() {
    // 每次显示页面时更新数据
    this.updateStatsData();
  },

  // 更新统计数据
  updateStatsData: function() {
    const app = getApp();
    const userData = app.globalData.userData;
    
    // 计算完成的任务数量
    const completedTasks = this.calculateCompletedTasks(userData.tasks);
    
    // 计算碎片总数
    const fragments = this.calculateTotalFragments(userData.rewards);
    
    // 计算兑换的奖励数量
    const exchangedRewards = this.calculateExchangedRewards(userData.rewards);
    
    // 生成学习记录
    const learningRecords = this.generateLearningRecords(userData.tasks, userData.rewards);
    
    // 获取最近完成的任务
    const recentTasks = this.getRecentCompletedTasks(userData.tasks);
    
    // 更新数据
    this.setData({
      completedTasksCount: completedTasks,
      totalFragments: fragments,
      exchangedRewardsCount: exchangedRewards,
      learningRecords: learningRecords,
      recentTasks: recentTasks
    });
    
    // 绘制图表
    this.drawChart(learningRecords);
  },

  // 计算完成的任务数量
  calculateCompletedTasks: function(tasks) {
    if (!tasks || !tasks.length) return 0;
    return tasks.filter(task => task.status === 'completed').length;
  },

  // 计算获得的碎片总数
  calculateTotalFragments: function(rewards) {
    if (!rewards) return 0;
    return rewards.totalFragments + (rewards.usedFragments || 0);
  },

  // 计算兑换的奖励数量
  calculateExchangedRewards: function(rewards) {
    if (!rewards || !rewards.exchangeHistory) return 0;
    return rewards.exchangeHistory.length;
  },

  // 生成学习记录
  generateLearningRecords: function(tasks, rewards) {
    const records = [];
    
    // 添加任务完成记录
    if (tasks && tasks.length) {
      tasks.forEach(task => {
        if (task.status === 'completed' && task.completedAt) {
          records.push({
            type: 'task',
            title: `完成任务：${task.name}`,
            date: task.completedAt,
            icon: '✅'
          });
        }
      });
    }
    
    // 添加奖励兑换记录
    if (rewards && rewards.exchangeHistory && rewards.exchangeHistory.length) {
      rewards.exchangeHistory.forEach(record => {
        records.push({
          type: 'reward',
          title: `兑换奖励：${record.rewardName} (${record.cost}碎片)`,
          date: record.date,
          icon: '🎁'
        });
      });
    }
    
    // 按日期降序排序
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return records;
  },

  // 获取最近完成的任务
  getRecentCompletedTasks: function(tasks) {
    if (!tasks || !tasks.length) return [];
    
    return tasks
      .filter(task => task.status === 'completed' && task.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);
  },

  // 绘制学习趋势图表
  drawChart: function(learningRecords) {
    // 按日期分组统计记录数量
    const dailyStats = {};
    const today = new Date();
    
    // 生成过去7天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = this.formatChartDate(date);
      dailyStats[dateStr] = 0;
    }
    
    // 统计每天的记录数量
    learningRecords.forEach(record => {
      const recordDate = new Date(record.date);
      const dateStr = this.formatChartDate(recordDate);
      
      if (dailyStats.hasOwnProperty(dateStr)) {
        dailyStats[dateStr]++;
      }
    });
    
    // 准备图表数据
    const chartData = {
      labels: Object.keys(dailyStats),
      data: Object.values(dailyStats)
    };
    
    this.setData({
      chartData: chartData
    });
    
    // 使用canvas绘制图表
    this.drawCanvasChart(chartData);
  },

  // 绘制canvas图表
  drawCanvasChart: function(chartData) {
    // 获取canvas上下文
    const ctx = wx.createCanvasContext('learningChart');
    
    // 设置图表尺寸
    const canvasWidth = 300;
    const canvasHeight = 150;
    const padding = 30;
    const chartWidth = canvasWidth - 2 * padding;
    const chartHeight = canvasHeight - 2 * padding;
    
    // 清除画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制坐标轴
    ctx.setStrokeStyle('#999999');
    ctx.setLineWidth(1);
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(padding, canvasHeight - padding);
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.stroke();
    
    // 绘制数据点
    if (chartData && chartData.labels && chartData.data) {
      const maxValue = Math.max(...chartData.data, 1); // 确保至少为1
      const barWidth = chartWidth / chartData.labels.length * 0.6;
      const barGap = chartWidth / chartData.labels.length * 0.4;
      
      chartData.data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + barGap);
        const y = canvasHeight - padding - barHeight;
        
        // 绘制柱状图
        ctx.setFillStyle('#4ECDC4');
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 绘制标签
        ctx.setFontSize(10);
        ctx.setFillStyle('#666666');
        ctx.fillText(chartData.labels[index], x + barWidth / 2 - 10, canvasHeight - padding + 15);
      });
    }
    
    // 绘制图表
    ctx.draw();
  },

  // 格式化日期（用于图表）
  formatChartDate: function(date) {
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    return `${month}/${day}`;
  },

  // 格式化完整日期
  formatFullDate: function(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
});