const app = getApp()

Page({
    data: {
        errMsg: '',
        address: '',
        // 标识当前选中的tab页签:0图文详情; 1规格参数
        active: 0,
        // 标识当前购物车中选中的商品数量
        count: 0
    },

    onLoad(options) {
        // const addr = wx.getStorageSync('address')
        const addr = app.globalData.address
        // 页面加载获取购物车中选中的商品数量
        // let count = 0

        // app.globalData.cart.forEach(it => {
        //     if (it.check) {
        //         count += it.count
        //     }
        // })

        // console.log('--total: ', count)

        this.setData({
            address: addr.provinceName
                ? addr.provinceName + addr.cityName + addr.countyName + addr.detailInfo
                : '请选择收货地址',
            count: app.globalData.cart.reduce((sum, item) => {
                return sum + (item.check ? item.count : 0)
            }, 0)
        })
        this._fetchData()
    },

    _preview(ev) {
        wx.previewImage({
            current: ev.currentTarget.dataset.pic,
            urls: this.data.pics.map(it => it.pics_big)
        })
    },

    async _fetchData() {
        try {
            let ret = await wx.requestAsync({
                url: 'goods/detail',
                data: {goods_id: this.options.goods_id || this.options.id}
            })

            this.setData(ret)
        }
        catch(err) {
            console.log(err)
            this.setData({errMsg: '获取详情页数据失败'})
        }
    },

    async _chooseAddress() {
        try {
            let ret = await app._chooseAddress()

            // 获取到收货地址数据后
            this.setData({
                address: ret.provinceName + ret.cityName + ret.countyName + ret.detailInfo
            })
        }
        catch(err) {

        }
    },

    // 如果点击的元素不是高亮的再切换
    _toggle(ev) {
        if (this.data.active != ev.currentTarget.dataset.index) {
            this.setData({
                active: ev.currentTarget.dataset.index
            })
        }
    },

    // 加入购物车
    // 1. 定义一个变量，来标识这是购物车数据，后续操作(增删改查)围绕该数据进行
    // 2. 设计购物车数据的类型: 有多个商品，每个商品需要 图片 价格 名字 数量 id 是否选中. 所以: 购物车数据使用数组存储
    // 3. 购物车数据放置在哪里维护: 购物车在多个页面，所以存放在全局中
    _join() {
        const {goods_id, goods_name, goods_price,goods_big_logo} = this.data

        // 1. 检查当前的商品是否已经在购物车，是则把当前购物车中该商品的数量+1，否则新增一项商品
        const index = app.globalData.cart.findIndex(it => {
            return +it.id === +goods_id
        })

        if (index === -1) {
            app.globalData.cart.push({
                id: goods_id,
                name: goods_name,
                price: goods_price,
                count: 1,
                pic: goods_big_logo,
                check: true
            })
        }
        else {
            app.globalData.cart[index].count++
        }

        // 加入购物车后重新计算购物车选中的商品的数量
        this.setData({
            count: app.globalData.cart.reduce((sum, item) => {
                return sum + (item.check ? item.count : 0)
            }, 0)
        })

        // 持久化存储购物车数据到storage
        app._storeCarts()
    },

    _toCarts() {
        wx.switchTab({url: '/pages/cart/cart'})
    }
})