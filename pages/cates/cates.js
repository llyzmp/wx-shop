const app = getApp()

Page({
    data: {
        // 标识页面数据状态
        // pending: 页面提示loading是复用了接口的提示 => resolve: cates.length /reject: '获取分类数据失败，请重试'
        errMsg: '',
        cates: [],
        // 标识当前被选中的一级分类的索引
        idx: 0,
        // 定义区域滚动高度
        wh: 0
    },

    _toggle(ev) {
        this.setData({
            idx: ev.currentTarget.dataset.idx
        })
    },

    onLoad() {
        this._fetchData()

        /*
        const arr = [
            {
                id: 1,
                name: 'a',
                children: [
                    {
                        id: 4,
                        name: 'd'
                    }
                ]
            },
            {
                id: 2,
                name: 'b',
                children: [
                    {
                        id: 5,
                        name: 'e'
                    }
                ]
            },
            {
                id: 3,
                name: 'c'
            }
        ]

        // id为2的项被选中了
        let active = 2
        // 查询id为2的项的children
        let target = []
        arr.forEach((item, index) => {
            if (item.id === active) {
                target = item.children
            }
        })

        // 遍历二级分类 使用target
        // 方案2使用索引, current标识当前选中项的索引
        let current = 2
        arr[current].children
        */
    },

    async _fetchData() {
        try {
            let cates = await wx.requestAsync({url: 'categories'})

            this.setData({
                cates: cates,
                wh: app.globalData.sysInfo.windowHeight || 0,
                errMsg: cates.length ? '' : '获取分类数据失败，请重试'
            })
        }
        catch(err) {
            this.setData({errMsg: '获取分类数据失败，请重试'})
        }
    },

    _goGoodsList(ev) {
        wx.navigateTo({url: '/pages/goods_list/index?cid=' + ev.currentTarget.dataset.cid})
    },

    // onShow() {
    //     app._setTabBarBadge()
    // },

    onShow_bak() {
        let cates = [
            {
                id: 1,
                name: 'a',
                pid: 0
            },
            {
                id: 2,
                name: 'b',
                pid: 1,
            },
            {
                id: 3,
                name: 'c',
                pid: 0
            },
            {
                id: 4,
                name: 'd',
                pid: 3
            }
        ]

        // 递归 传递 回归

        function transData(arr, pid) {
            if (!Array.isArray(arr) || !arr.length) {
                return arr
            }

            let ret = []

            arr.forEach(item => {
                if (item.pid == pid) {
                    ret.push({
                        id: item.id,
                        name: item.name,
                        pid: item.pid,
                        children: transData(arr, item.id)
                    })
                }
            })

            return ret
        }

        let ret = transData(cates, 0)

        console.log('--ret: ', ret)
    }
})