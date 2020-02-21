const PAGESIZE = 20

Page({
    data: {
        goods: []
    },
    onLoad(options) {
        // 1.传递过去 使用该数据
        // 2.将数据放在一个都能访问到的地方，需要时去取
        this._fetchData()
    },

    async _fetchData(pagenum=1) {
        try {
            this.loading = true

            let ret = await wx.requestAsync({
                url: 'goods/search',
                data: {
                    query: this.options.query,
                    cid: this.options.cid,
                    pagenum,
                    pagesize: PAGESIZE
                }
            })

            // 如果一次获取数据（页面加载）失败，整个页面是不可用的，所以页面上提示获取数据失败
            // 如果是分页加载时，获取失败，那么用户可以使用已经加载到的数据，当前页数据获取失败使用弹层形式提示失败

            if (ret && Array.isArray(ret.goods) && ret.goods.length) {
                /*
                console.time('setData')
                this.setData({
                    pagenum: +ret.pagenum,
                    // 全量更新: 每次都把全部数据传输到渲染层
                    goods: [...this.data.goods, ...ret.goods],
                    pagesize: PAGESIZE,
                    total: ret.total
                }, () => {
                console.timeEnd('setData')
                })
                */

                // 优化方案：增量更新
                const data = {
                    pagenum: +ret.pagenum,
                    pagesize: PAGESIZE,
                    total: ret.total
                }

                // 如果是第一次获取数据 data.goods从0-19
                // 后续更新第二页数据 data.goods从20-39 以此类推
                for(let i = 0; i < ret.goods.length; i++) {
                    data['goods[' + (this.data.goods.length + i) + ']'] = ret.goods[i]
                }

                console.time('setData')
                this.setData(data, () => {
                    console.timeEnd('setData')
                })
            }
            // 如果接口状态码正常，但是接口数据goods不是一个数组或者是一个空数组的情况
            else {
                if (pagenum == 1) {
                    this.setData({errMsg: '获取商品列表数据失败'})
                }
                else {
                    wx.showToast({
                        title: '分页数据获取失败',
                        icon: 'none'
                    })
                }
            }
        }
        catch(err) {
            if (pagenum == 1) {
                this.setData({errMsg: '获取商品列表数据失败'})
            }
            else {
                wx.showToast({
                    title: '分页数据获取失败',
                    icon: 'none'
                })
            }
        }
        finally {
            this.loading = false
        }
    },

    // 监听到页面触底这个动作
    // 1. 判断是否还有数据: 用总数据条数(this.data.total) 和 当前已经加载的总条数(PAGESIZE * this.data.pagenum)进行比对，已经加载的总条数>=数据总条数说明已经全部加载
    // 2. 如果当前正在请求分页数据，那么不应该再次触发该请求
    // 3. 此时加载下一页数据
    onReachBottom() {
        if (this.data.pagenum * PAGESIZE >= this.data.total || this.loading) {
            return false
        }

        this._fetchData(+this.data.pagenum + 1)
    },

    _goGoodsDetail(ev) {
        wx.navigateTo({
            url: '/pages/goods_detail/index?goods_id=' + ev.currentTarget.dataset.id
        })
    }
})