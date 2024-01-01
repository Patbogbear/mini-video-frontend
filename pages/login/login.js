// login.js
Page({
  data: {
    isLoggedIn: true
  },
  
  onLogin() {
    // 使用 wx.getUserProfile 获取用户信息
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (profileRes) => {
        // 用户成功授权，继续登录流程
        this.processLogin(profileRes);
      },
      fail: (err) => {
        // 用户拒绝授权处理
        console.log('授权失败:', err);  // 添加日志输出以帮助调试
        wx.showModal({
          title: '授权提示',
          content: '我们需要获取您的公开信息（昵称、头像等），以确保正常使用所有功能。',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },
  
  // 封装登录流程为一个方法
  processLogin(profileRes) {
    wx.login({
      success: res => {
        if (res.code) {
          // 将code和用户信息发送到后端服务器
          this.loginRequest(res.code, profileRes.userInfo);
        } else {
          // 无法获取微信code
          wx.showToast({
            title: '微信登录失败，请重试',
            icon: 'none'
          });
        }
      }
    });
  },
  
  // 封装发送登录请求的代码
  loginRequest(code, userInfo) {
    wx.request({
      url: 'https://video-node-server-79930-6-1322380463.sh.run.tcloudbase.com/login',
      data: {
        code: code,
        nickname: userInfo.nickName,  // 用户昵称
        avatar: userInfo.avatarUrl    // 用户头像
      },
      method: 'POST',
      success: res => {
        if (res.statusCode == 200 && res.data.token) {
          // 存储用户登录状态和token
          wx.setStorage({
            key: "userToken",
            data: res.data.token
          });
          this.setData({
            isLoggedIn: true
          });
          // 跳转到摄像头扫描页面
          wx.navigateTo({
            url: '../scanDevices/scanDevices'
          });
        } else {
          // 处理登录失败
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: () => {
        // 网络或服务器错误处理
        wx.showToast({
          title: '无法连接到服务器',
          icon: 'none'
        });
      }
    });
  },
  
  onScanDevices() {
    // 跳转到设备扫描界面的逻辑
    wx.navigateTo({
      url: '../scanDevices/scanDevices'
    });
  }
});