export default class SocketService {
  // 定义为单例模式进行编写

  static instance = null;
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端链接的socket对象
  ws = null;

  // 存储回调函数
  callBackMapping = {};

  // 标识是否链接成功了
  connected = false;
  // 链接重试次数
  sendRetryCount = 0;

  // 重新连接的尝试次数
  connectRetryCount = 0;

  // 定义链接服务器的方法
  connect() {
    // 链接服务器
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持websocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')

    // 连接成功事件
    this.ws.onopen = () => {
      console.log('链接服务端成功了')
      this.connected = true
      this.connectRetryCount = 0
    }
    // 链接服务端失败
    this.ws.onclose = () => {
      console.log('链接服务端失败')
      this.connected = false
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, this.connectRetryCount * 500)
    }
    // 得到服务端发送的数据
    this.ws.onmessage = (msg) => {
      console.log('从服务端获得到了数据')
      // 返还回来的数据存储在msg.data中
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      // 判断回调函数是否存在
      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScrenn') {
        } else if (action === 'themeChange') {
        }
      }
    }
  }

  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }

  // 回调函数的取消
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }

  // 发送数据的方法
  send(data) {
    // 判断是否链接成功
    if (this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetryCount * 500)
    }
  }
}
