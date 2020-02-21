const app = getApp()

Page({
    data: {
        cart: []
    },
    onShow() {
        // 获取购物车数据
        // 获取是否有不选中的项
        const hasUnCheck = app.globalData.cart.some(it => !it.check)

        // 获取是否全选
        const allcheck = app.globalData.cart.every(it => it.check)

        this.setData({
            cart: app.globalData.cart || [],
            allcheck: allcheck,
            total: app.globalData.cart.reduce((sum, it) => sum + (it.check ? it.price * it.count : 0), 0)
        })

        // app._setTabBarBadge()
    },
    // 监听到商品项的数量变化
    _update(ev) {
        const {count, id} = ev.detail

        // 1. 更新购物车数据
        this.data.cart.forEach(it => {
            if (it.id == id) {
                it.count = count
            }
        })

        this._updateCart(this.data.cart)
    },

    // 删除商品
    _delete(ev) {
        // 使用for循环方式获取没有被删除的商品项
        // const cart = []
        // for(let i = 0; i < this.data.cart.length; i++) {
        //     if (ev.currentTarget.dataset.id != this.data.cart[i].id) {
        //         cart.push(this.data.cart[i])
        //     }
        // }
        const cart = this.data.cart.filter(item => item.id != ev.currentTarget.dataset.id)

        this._updateCart(cart)
    },

    // 切换商品选中态
    _toggle(ev) {
        this.data.cart.forEach(it => {
            if (it.id == ev.currentTarget.dataset.id) {
                it.check = !it.check
            }
        })

        this._updateCart(this.data.cart)
    },

    // 全选与全不选
    // 1. 看当前的商品中有 [没有选中] => 可以把[没有选中]的项改成选中或者把那些选中的项改成不选中
    // 2. 如果全部是不选中的 => 改成全选中
    // 3. 如果全部是选中的 => 改成全部 [不选中]
    // 分析后处理逻辑:
    // 如果有一个【不选中】, 对应上述的1 2情况，改成全选
    // 否则就是情况3 改成全不选
    _toggleAll() {
        // hasUnCheck变量：标识是否有 [不选中] 的项
        const hasUnCheck = this.data.cart.some(it => !it.check)

        this.data.cart.forEach(it => {
            // 如果有【不选中】，把所有的项都改成选中 it.check = true
            // hasUnCheck: true => it.check = true
            // 如果没有【不选中】，把所有的项都改成 不选中 it.check = false
            // hasUnCheck: false => it.check = false
            it.check = hasUnCheck
        })

        // 把最新的购物车数据传递更新函数
        this._updateCart(this.data.cart)
    },

    // 统一处理购物车数据的存储和allcheck total变量的计算
    _updateCart(cart) {
        // 2. 把购物车数据更新到页面上
        this.setData({
            cart: cart,
            allcheck: cart.every(it => it.check),
            total: cart.reduce((sum, it) => sum + (it.check ? it.price * it.count : 0), 0)
        })

        // 3. 更新到globalData.cart全局数据的cart上
        app.globalData.cart = cart

        // 4. 存储到storage中
        app._storeCarts()
    },

    // 1. 提交订单
    // 2. 优化购物车数据的存储
    // 3. 设置购物车tab栏的徽章
    _submit() {
        // 如果没有选中的商品、选中商品的总金额为0，阻止提交订单
        const hasCheck = this.data.cart.some(it => it.check)

        if (!hasCheck || this.data.total == 0) {
            wx.showToast({
                title: '请选择商品或者商品总金额不能为0',
                icon: 'none'
            })

            return false
        }

        wx.navigateTo({
            url: '/pages/confirm/index'
        })
    }
})