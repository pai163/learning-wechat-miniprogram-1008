// pages/tasks/tasks.js
Page({
  data: {
    currentTask: null,
    tasks: [],
    showEditModal: false,
    showDiceModal: false,
    showSuccessModal: false,
    showCompleteModal: false,
    showDeleteModal: false,
    editTaskId: null,
    editTaskName: '',
    modalTitle: '添加任务',
    selectedTask: null,
    showToast: false,
    toastMessage: ''
  },

  onLoad: function() {
    this.updateTaskList();
  },

  onShow: function() {
    // 每次显示页面时，从全局数据获取最新任务信息
    this.updateTaskList();
  },

  // 更新任务列表
  updateTaskList: function() {
    const app = getApp();
    const tasks = app.globalData.userData.tasks || [];
    
    // 查找当前正在进行的任务或随机选择一个待完成任务
    let currentTask = tasks.find(task => task.status === 'inProgress');
    if (!currentTask) {
      const pendingTasks = tasks.filter(task => task.status === 'pending');
      if (pendingTasks.length > 0) {
        // 随机选择一个待完成任务
        const randomIndex = Math.floor(Math.random() * pendingTasks.length);
        currentTask = pendingTasks[randomIndex];
      }
    }
    
    this.setData({
      tasks: tasks,
      currentTask: currentTask
    });
  },

  // 打开骰子动画弹窗
  rollDice: function() {
    this.setData({
      showDiceModal: true
    });
    
    // 播放骰子动画后选择任务
    setTimeout(() => {
      this.selectRandomTask();
    }, 1500);
  },

  // 随机选择一个任务
  selectRandomTask: function() {
    const app = getApp();
    const tasks = app.globalData.userData.tasks || [];
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    
    if (pendingTasks.length === 0) {
      this.closeDiceModal();
      this.showToast('没有待完成的任务');
      return;
    }
    
    // 使用Fisher-Yates洗牌算法随机选择一个任务
    for (let i = pendingTasks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pendingTasks[i], pendingTasks[j]] = [pendingTasks[j], pendingTasks[i]];
    }
    
    const selectedTask = pendingTasks[0];
    
    // 更新任务状态为进行中
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return { ...task, status: 'inProgress' };
      }
      return task;
    });
    
    // 更新骰子使用次数
    app.globalData.userData.diceStats.todayRolls += 1;
    app.globalData.userData.diceStats.usedRolls += 1;
    
    // 更新当前任务
    this.setData({
      tasks: updatedTasks,
      currentTask: { ...selectedTask, status: 'inProgress' }
    });
    
    // 保存到全局数据
    app.globalData.userData.tasks = updatedTasks;
    app.saveUserData();
    
    this.closeDiceModal();
    this.showToast('任务已选择：' + selectedTask.name);
  },

  // 打开任务编辑弹窗
  openEditTaskModal: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (task) {
      this.setData({
        showEditModal: true,
        editTaskId: taskId,
        editTaskName: task.name,
        modalTitle: '编辑任务'
      });
    }
  },

  // 添加新任务
  addTask: function() {
    this.setData({
      showEditModal: true,
      editTaskId: null,
      editTaskName: '',
      modalTitle: '添加任务'
    });
  },

  // 输入任务名称
  onTaskNameInput: function(e) {
    this.setData({
      editTaskName: e.detail.value
    });
  },

  // 保存任务
  saveTask: function() {
    const { editTaskId, editTaskName, tasks } = this.data;
    const app = getApp();
    
    if (!editTaskName.trim()) {
      this.showToast('请输入任务名称');
      return;
    }
    
    let updatedTasks;
    
    if (editTaskId) {
      // 编辑现有任务
      updatedTasks = tasks.map(task => {
        if (task.id === editTaskId) {
          return { ...task, name: editTaskName.trim() };
        }
        return task;
      });
    } else {
      // 添加新任务
      const newTask = {
        id: Date.now(),
        name: editTaskName.trim(),
        status: 'pending',
        createTime: this.formatDate(new Date()),
        completedAt: null
      };
      updatedTasks = [...tasks, newTask];
    }
    
    this.setData({
      tasks: updatedTasks,
      showEditModal: false
    });
    
    // 保存到全局数据
    app.globalData.userData.tasks = updatedTasks;
    app.saveUserData();
    
    this.showToast(editTaskId ? '任务已更新' : '任务已添加');
  },

  // 打开任务完成确认弹窗
  openCompleteTaskModal: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (task) {
      this.setData({
        showCompleteModal: true,
        selectedTask: task
      });
    }
  },

  // 确认完成任务
  confirmCompleteTask: function() {
    const { selectedTask, tasks } = this.data;
    const app = getApp();
    
    if (!selectedTask) return;
    
    // 更新任务状态为已完成
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return { 
          ...task, 
          status: 'completed', 
          completedAt: this.formatDate(new Date()) 
        };
      }
      return task;
    });
    
    // 增加碎片数量（完成一个任务获得一个碎片）
    app.globalData.userData.rewards.totalFragments += 1;
    
    // 增加完成任务统计
    app.globalData.userData.diceStats.completedTasks += 1;
    
    // 更新当前任务
    const currentTask = this.data.currentTask;
    const newCurrentTask = currentTask && currentTask.id === selectedTask.id ? null : currentTask;
    
    this.setData({
      tasks: updatedTasks,
      currentTask: newCurrentTask,
      showCompleteModal: false,
      showSuccessModal: true
    });
    
    // 保存到全局数据
    app.globalData.userData.tasks = updatedTasks;
    app.saveUserData();
  },

  // 打开任务删除确认弹窗
  openDeleteTaskModal: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (task) {
      this.setData({
        showDeleteModal: true,
        selectedTask: task
      });
    }
  },

  // 确认删除任务
  confirmDeleteTask: function() {
    const { selectedTask, tasks } = this.data;
    const app = getApp();
    
    if (!selectedTask) return;
    
    // 从任务列表中删除任务
    const updatedTasks = tasks.filter(task => task.id !== selectedTask.id);
    
    // 更新当前任务
    const currentTask = this.data.currentTask;
    const newCurrentTask = currentTask && currentTask.id === selectedTask.id ? null : currentTask;
    
    this.setData({
      tasks: updatedTasks,
      currentTask: newCurrentTask,
      showDeleteModal: false
    });
    
    // 保存到全局数据
    app.globalData.userData.tasks = updatedTasks;
    app.saveUserData();
    
    this.showToast('任务已删除');
  },

  // 关闭弹窗
  closeEditModal: function() { this.setData({ showEditModal: false }); },
  closeDiceModal: function() { this.setData({ showDiceModal: false }); },
  closeSuccessModal: function() { this.setData({ showSuccessModal: false }); },
  closeCompleteModal: function() { this.setData({ showCompleteModal: false }); },
  closeDeleteModal: function() { this.setData({ showDeleteModal: false }); },
  
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
  }
});