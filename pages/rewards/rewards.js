// pages/rewards/rewards.js
Page({
  data: {
    fragments: 0, // 学习碎片数量
    rewards: [], // 奖励列表
    exchangeRecords: [], // 兑换记录
    showAddRewardModal: false, // 添加奖励弹窗显示状态
    showExchangeConfirmModal: false, // 兑换确认弹窗显示状态
    showExchangeSuccessModal: false, // 兑换成功弹窗显示状态
    showToast: false, // 提示弹窗显示状态
    toastMessage: '', // 提示消息
    newRewardName: '', // 新奖励名称
    newRewardCost: '', // 新奖励所需碎片数量
    selectedReward: null // 选中的奖励项
  },

  onLoad: function() {
    // 从全局数据获取奖励和碎片信息
    this.updateRewardsData();
  },

  onShow: function() {
    // 每次显示页面时更新数据
    this.updateRewardsData();
  },

  // 更新奖励数据
  updateRewardsData: function() {
    const app = getApp();
    this.setData({
      fragments: app.globalData.userData.rewards.totalFragments || 0,
      rewards: app.globalData.userData.rewards.rewardList || [],
      exchangeRecords: app.globalData.userData.rewards.exchangeHistory || []
    });
  },

  // 打开添加奖励弹窗
  openAddRewardModal: function() {
    this.setData({
      showAddRewardModal: true,
      newRewardName: '',
      newRewardCost: ''
    });
  },

  // 关闭添加奖励弹窗
  closeAddRewardModal: function() {
    this.setData({
      showAddRewardModal: false
    });
  },

  // 输入奖励名称
  onRewardNameInput: function(e) {
    this.setData({
      newRewardName: e.detail.value
    });
  },

  // 输入奖励所需碎片数量
  onRewardCostInput: function(e) {
    // 确保输入的是数字
    const value = e.detail.value;
    if (value === '' || !isNaN(value)) {
      this.setData({
        newRewardCost: value
      });
    }
  },

  // 保存奖励
  saveReward: function() {
    const { newRewardName, newRewardCost } = this.data;
    
    // 验证输入
    if (!newRewardName.trim()) {
      this.showToast('请输入奖励名称');
      return;
    }
    
    if (!newRewardCost || isNaN(newRewardCost) || parseInt(newRewardCost) <= 0) {
      this.showToast('请输入有效的碎片数量');
      return;
    }
    
    // 创建新奖励
    const newReward = {
      id: Date.now(), // 使用时间戳作为唯一ID
      name: newRewardName.trim(),
      cost: parseInt(newRewardCost)
    };
    
    // 获取全局数据
    const app = getApp();
    const rewardList = [...app.globalData.userData.rewards.rewardList, newReward];
    
    // 更新数据
    this.setData({
      rewards: rewardList,
      showAddRewardModal: false
    });
    
    // 保存到全局数据
    app.globalData.userData.rewards.rewardList = rewardList;
    app.saveUserData();
    
    this.showToast('奖励添加成功');
  },

  // 打开兑换确认弹窗
  exchangeReward: function(e) {
    const rewardId = e.currentTarget.dataset.id;
    const selectedReward = this.data.rewards.find(reward => reward.id === rewardId);
    
    this.setData({
      showExchangeConfirmModal: true,
      selectedReward: selectedReward
    });
  },

  // 关闭兑换确认弹窗
  closeExchangeConfirmModal: function() {
    this.setData({
      showExchangeConfirmModal: false,
      selectedReward: null
    });
  },

  // 确认兑换
  confirmExchange: function() {
    const { selectedReward, fragments } = this.data;
    const app = getApp();
    
    if (!selectedReward) return;
    
    // 检查碎片是否足够
    if (fragments < selectedReward.cost) {
      this.showToast('碎片数量不足');
      return;
    }
    
    // 扣减碎片
    const newFragments = fragments - selectedReward.cost;
    
    // 添加兑换记录
    const newRecord = {
      id: Date.now(),
      rewardName: selectedReward.name,
      cost: selectedReward.cost,
      date: this.formatDate(new Date())
    };
    
    // 获取当前兑换历史
    const exchangeHistory = app.globalData.userData.rewards.exchangeHistory || [];
    const newExchangeHistory = [newRecord, ...exchangeHistory];
    
    // 更新使用的碎片数量
    app.globalData.userData.rewards.usedFragments += selectedReward.cost;
    
    // 更新数据
    this.setData({
      fragments: newFragments,
      exchangeRecords: newExchangeHistory,
      showExchangeConfirmModal: false,
      showExchangeSuccessModal: true
    });
    
    // 保存到全局数据
    app.globalData.userData.rewards.totalFragments = newFragments;
    app.globalData.userData.rewards.exchangeHistory = newExchangeHistory;
    app.saveUserData();
  },

  // 关闭兑换成功弹窗
  closeExchangeSuccessModal: function() {
    this.setData({
      showExchangeSuccessModal: false,
      selectedReward: null
    });
  },

  // 显示提示消息
  showToast: function(message) {
    this.setData({
      showToast: true,
      toastMessage: message
    });
    
    // 2秒后自动隐藏
    setTimeout(() => {
      this.setData({
        showToast: false
      });
    }, 2000);
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 空函数，用于阻止事件冒泡到父元素
  }
});