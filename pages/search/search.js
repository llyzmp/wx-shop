const app = getApp()

Page({
    data: {
        sugList: [],
        query: '',
        // 历史记录数据
        history: []
    },

    onLoad() {
        // 页面加载时 获取一下以往的历史记录数据
        // 同步方式
        // 如果获取不到历史记录 兼容赋值一个空数组
        this.setData({
            history: wx.getStorageSync('history') || []
        })

        // 备注: 如果将来历史记录数据存储到服务器，这样用户更换设备也可以共享其历史记录信息。前端需要做的操作是，在页面加载时
        // 1. 向服务器发请求获取存储在服务器的历史记录
        // 2. 读取本地的历史记录，将两者合并去重，赋值到页面使用的数据变量上进行使用

        // 异步方式
        // wx.getStorage({
        //     key: 'history',
        //     success: res => {
        //         this.setData({
        //             history: res.data
        //         })
        //     }
        // })
    },

    // onShow() {
    //     app._setTabBarBadge()
    // },

    // 清空搜索内容 和 搜索建议项
    _clear() {
        this.setData({
            query: '',
            sugList: []
        })
    },

    // 清除历史记录
    // 1. 清空当前页面使用的历史记录数据
    // 2. 清除storage中的历史记录
    _clean() {
        this.setData({history: []})

        // 1. 通过设置一个空数组来清已有数据
        // wx.setStorage({
        //     key: 'history',
        //     data: []
        // })

        // 2. 通过指定key来清除存储的storage
        wx.removeStorage({
            key: 'history'
        })
    },

    // 确认搜索
    // 1. 把搜索的内容存入历史记录, 需要考虑去重, 显示最近的10条记录
    // 2. 跳转到符合当前搜索内容的所有商家的列表页去
    _confirm(ev) {
        // 输入框的内容可以使用this.data.query获取 或者 ev.detail.value
        let query = ev.detail.value.trim()

        // 判断当前输入的内容是否已经在历史记录中
        // 方法1: indexOf 比对基本类型的数据是否存在于数组中，存在返回其索引，不存在返回-1
        // 方法2: findIndex 可以比对任意类型，返回匹配到的项的索引，匹配不到返回-1
        // 方法3: includes方法，严格匹配(类型与值都相同)
        // 方法4: some方法
        // this.data.history.findIndex((item, index) => {
        //     return item === query
        // })

        if (!this.data.history.includes(query)) {
            this.data.history.unshift(query)

            let history = this.data.history.slice(0, 10)

            this.setData({history})

            // 方法2 使用concat连接出新数组
            // 方法3 使用扩展运算符
            // this.setData({
                // history: [query].concat(this.data.history).slice(0, 10)
                // history: [query, ...this.data.history].slice(0, 10)
            // })

            // 在_confirm中
            // 为了下次用户打开时还能看到以往的搜索历史，需要把历史记录数据持久化存储下来，小程序中前端存储采用storage
            // 本地的storage是分用户的 是存储在当前的设备上的，更换设备就不存在了
            wx.setStorage({
                key: 'history',
                data: history
            })
        }

        wx.navigateTo({
            url: '/pages/goods_list/index?query=' + query
        })
    },

    // 注意: 1. 不要使用return返回值，小程序会把return的值当做input的value值
    // 注意: 2. 不要在bindinput监听事件处理函数中使用异步操作，会将promise类型作为input的value值
    // if(!query) {
    //     return false
    // }
    _input(ev) {
        // String.prototype.trim 去掉字符串前后的空格
        const query = ev.detail.value.trim()

        clearTimeout(this.timer)

        this.timer = setTimeout(
            () => {
                this._handler(query)
            },
            1000
        )
    },
    // abc: 用户先输入了abc，然后进行删除，输入框的内容依次剩下ab; a; ''
    // ab
    // a
    // ''
    _handler(query) {
        // 1. 如果有内容 进行【搜索建议项】查询 throttle节流函数
        // 优化点: 对用户的输入进行请求时进行节流: 在一个动作停止后再发起后续的处理操作
        if (query) {
            this.setData({query})

            this._fetchSugList(query)
        }
        // 2. 否则不进行查询 同时清掉已有的查询词 和 搜索建议项数据
        else {
            this.setData({
                query: '',
                sugList: []
            })
        }
    },

    // 查询搜索建议项, 对返回结果的处理思路: 有返回值则更新到sugList中，没有返回值或者出错不进行更新
    // 假设用户搜索abc, 最终匹配到的结果数是5个。随着范围的缩小，匹配到结果是逐次递减，而不会出现中间的匹配条数小于最终的匹配条数
    // 输入a 匹配到的结果是10
    // 输入ab 匹配到的结果是8: 如果在这里返回了失败，将sugList赋值为[]，下次abc返回5个，那么产生闪烁跳跃不利于用户使用，也不符合常识
    // 输入abc 匹配到的结果5
    async _fetchSugList(query) {
        try {
            let sugList = await wx.requestAsync({
                url: 'goods/qsearch',
                data: {query},
                hideLoading: true
            })

            this.setData({sugList})
        }
        catch(err) {
            // 如果需要提示，可以使用showToast给用于以提示
            wx.showToast({
                title: '获取搜索建议项数据失败',
                icon: 'none'
            })
        }
    },

    _goGoodsDetail(ev) {
        wx.navigateTo({
            url: '/pages/goods_detail/index?goods_id=' + ev.currentTarget.dataset.id
        })
    },

    _goGoodsList(ev) {
        wx.navigateTo({
            url: '/pages/goods_list/index?query=' + ev.currentTarget.dataset.query
        })
    }
})