//app.js
App({
  globalData: {
    userInfo: null,
    // 数据模型
    userData: {
      tasks: [],
      rewards: {
        totalFragments: 0,
        usedFragments: 0,
        rewardList: [],
        exchangeHistory: []
      },
      diceStats: {
        completedTasks: 0,
        usedRolls: 0,
        todayRolls: 0
      }
    }
  },
  onLaunch: function () {
    // 从本地存储加载数据
    const storedData = wx.getStorageSync('userData');
    if (storedData) {
      this.globalData.userData = storedData;
    } else {
      // 首次使用，提供初始数据
      // 格式化日期函数
      const formatDate = function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      };
      
      const initialTasks = [
        {
          id: Date.now() - 100000,
          name: "阅读30分钟",
          status: "pending",
          createTime: formatDate(new Date()),
          completedAt: null
        },
        {
          id: Date.now() - 200000,
          name: "练习编程1小时",
          status: "pending",
          createTime: formatDate(new Date()),
          completedAt: null
        },
        {
          id: Date.now() - 300000,
          name: "背诵10个单词",
          status: "completed",
          createTime: formatDate(new Date(Date.now() - 86400000)),
          completedAt: formatDate(new Date(Date.now() - 86400000))
        }
      ];
      
      const initialRewards = {
        totalFragments: 2,
        usedFragments: 1,
        rewardList: [
          {
            id: Date.now() - 400000,
            name: "休息30分钟",
            cost: 1
          },
          {
            id: Date.now() - 500000,
            name: "奖励一个雪糕",
            cost: 3
          }
        ],
        exchangeHistory: [
          {
            id: Date.now() - 600000,
            rewardName: "休息30分钟",
            cost: 1,
            date: formatDate(new Date(Date.now() - 172800000))
          }
        ]
      };
      
      const initialDiceStats = {
        completedTasks: 1,
        usedRolls: 0,
        todayRolls: 0
      };
      
      this.globalData.userData.tasks = initialTasks;
      this.globalData.userData.rewards = initialRewards;
      this.globalData.userData.diceStats = initialDiceStats;
      
      // 保存初始数据
      this.saveUserData();
    }
  },
  // 保存数据到本地存储
  saveUserData: function() {
    wx.setStorageSync('userData', this.globalData.userData);
  }
})