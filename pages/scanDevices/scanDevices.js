// pages/scanDevices/scanDevices.js
Page({
  data: {
    cameraAuthorized: false,
    cameraContext: null,
    imagePath: '',
  },

  onLoad() {
    this.setData({ cameraContext: wx.createCameraContext() });
  },

  takePhoto() {
    if (!this.data.cameraAuthorized) {
      this.checkCameraAuthorization(this.startCamera);
    } else {
      this.startCamera();
    }
  },

  startCamera() {
    this.data.cameraContext.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({ imagePath: res.tempImagePath });
        this.uploadPhoto(res.tempImagePath);
      },
      fail: () => {
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        });
      }
    });
  },

  checkCameraAuthorization(callback) {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              this.setData({ cameraAuthorized: true });
              if (callback) callback.call(this);
            },
            fail: () => {
              wx.showToast({
                title: '需要授权摄像头',
                icon: 'none'
              });
            }
          });
        } else {
          this.setData({ cameraAuthorized: true });
          if (callback) callback.call(this);
        }
      }
    });
  },

  chooseImageFromAlbum() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: (res) => {
        const imagePath = res.tempFilePaths[0];
        this.uploadPhoto(imagePath);
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  uploadPhoto(filePath) {
    wx.showLoading({
      title: '正在上传...',
    });

    wx.uploadFile({
      url: 'http://1.13.6.42:5000/predict', // 替换为您的服务器端接口
      filePath: filePath,
      name: 'file',
      success: (res) => {
        wx.hideLoading(); // 关闭加载提示
        const data = JSON.parse(res.data);
        if (data.success) {
          wx.showToast({
            title: '识别成功',
            icon: 'success'
          });
          // 处理识别结果
        } else {
          wx.showToast({
            title: data.error || '识别失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败，请检查网络',
          icon: 'none'
        });
      }
    });
  },

  // 其他生命周期函数和事件处理函数...
});
