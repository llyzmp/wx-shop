const app = getApp()
Page({
    data: {
        addr: {}
    },
    onLoad() {
        // 读取已经存储的收货地址信息
        const addr = app.globalData.address
        const cart = app.globalData.cart.filter(it => it.check)

        // 获取app.globalData.token值，有则表示已经登录，没有则未登录

        this.setData({
            addr,
            cart,
            money: cart.reduce((sum, item) => sum + item.price * item.count, 0),
            hasLogin: !!app.globalData.token
        })
    },

    async _chooseAddress() {
        console.log(1)
        let addr = await app._chooseAddress()

        this.setData({addr})
    },

    async _userinfo(ev) {
        try {
            const {signature, rawData, encryptedData, iv} = ev.detail

            let {code} = await wx.loginAsync()

            let ret = await wx.requestAsync({
                url: 'users/wxlogin',
                method: 'POST',
                data: {
                    code,
                    signature,
                    rawData,
                    encryptedData,
                    iv
                }
            })

            console.log('登录接口的返回值: ', ret)
            // 1. 赋值在globalData.token上 再发起接口使用
            app.globalData.token = ret.token

            // 2. 持久化存储到storage中，下次小程序启动时再从storage读取出来
            wx.setStorage({
                key: 'token',
                data: ret.token
            })
        }
        catch(err) {
            console.log('登录接口报错: ', err)
        }
    },

    // 下单购买
    // 1. 创建订单 发送商品信息以及收货地址等           返回订单编号
    // 2. 订单支付 发送订单编号                       返回小程序支付接口需要的5个参数
    // 3. 调用小程序支付接口
    async _purchase() {
        try {
            const {money, addr, cart} = this.data
            const goods = cart.map(it => {
                return {
                    goods_id: it.id, 
                    goods_number: it.count, 
                    goods_price:  it.price
                }
            })

            let {order_number} = await wx.requestAsync({
                url: 'my/orders/create',
                method: 'POST',
                data: {
                    order_price: money,
                    consignee_addr: addr.provinceName + addr.cityName + addr.countyName + addr.detailInfo,
                    order_detail: JSON.stringify(goods),
                    goods,
                }
            })

            console.log('创建订单接口返回值: ', order_number)

            let {pay} = await wx.requestAsync({
                url: 'my/orders/req_unifiedorder',
                method: 'POST',
                data: {order_number}
            })

            console.log('订单支付接口返回值: ', pay)

            let ret = await wx.requestPaymentAsync(pay)

            console.log('小程序支付接口返回值: ', ret)
            // 支付成功，跳转到个人中心 或者 单页
            wx.showToast({
                title: '支付成功',
                icon: 'success'
            })
        }
        catch(err) {
            console.log('下单支付报错: ', err)
            // 如果是取消，可以不进行提醒因为用户非常明确知道是自己取消
            if (err && !/cancel/.test(err.errMsg)) {
                wx.showToast({
                    title: '下单支付失败，请重试',
                    icon: 'none'
                })
            }
        }
    }
})