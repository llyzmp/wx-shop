const app = getApp()

Page({
    data: {
        swiperData: [],
        cates: [],
        floorData: []
    },
    onLoad() {
        // this._fetchSwiperData()

        // this._fetchCatesData()

        // this._fetchFloorData()

        // this._fetchData('home/swiperdata', 'swiperData')
        // this._fetchData('home/catitems', 'cates')
        // this._fetchData('home/floordata', 'floorData')

        this._fetchData('home/swiperdata', 'swiperData')
        this._fetchData('home/catitems', 'cates')
        this._fetchData('home/floordata', 'floorData')
    },

    // onShow() {
    //     app._setTabBarBadge()
    // },

    async _fetchData(url, type) {
        let errMsg = type === 'swiperData'
            ? '轮播图'
            : type === 'cates'
            ? '分类'
            : '楼层区域'

        try {
            let res = await wx.requestAsync({url})

            this.setData({
                [type]: res
            })
        }
        catch(err) {
            wx.showToast({
                title: '请求' + errMsg + '数据失败，请重试',
                icon: 'none'
            })
        }
    },

    _fetchData2(url, type) {
        let errMsg = type === 'swiperData'
            ? '轮播图'
            : type === 'cates'
            ? '分类'
            : '楼层区域'

        wx.request({
            url: 'https://uinav.com/api/public/v1/' + url,
            success: res => {
                // 接口返回200，同时接口的业务逻辑状态码也是200正常的情况；否则是非正常情况
                if (+res.statusCode === 200
                    && res.data && res.data.meta
                    && +res.data.meta.status === 200    
                ) {
                    this.setData({
                        [type]: res.data.message
                    })
                }
                else {
                    wx.showToast({
                        title: '请求' + errMsg + '数据失败，请重试',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                wx.showToast({
                    title: '请求' + errMsg + '数据失败，请重试',
                    icon: 'none'
                })
            },
            complete: () => {

            }
        })
    },

    // 请求轮播图数据
    _fetchSwiperData() {
        wx.request({
            url: 'https://uinav.com/api/public/v1/home/swiperdata',
            success: res => {
                // 接口返回200，同时接口的业务逻辑状态码也是200正常的情况；否则是非正常情况
                if (+res.statusCode === 200
                    && res.data && res.data.meta
                    && +res.data.meta.status === 200    
                ) {
                    this.setData({
                        swiperData: res.data.message
                    })
                }
                else {
                    wx.showToast({
                        title: '请求轮播图数据失败，请重试',
                        icon: 'none'
                    })
                }

                // 网络返回200
                // if (+res.statusCode === 200) {
                //     if (res.data && res.data.meta && +res.data.meta.status === 200) {
                //         this.setData({
                //             swiperData: res.data.message
                //         })
                //     }
                //     else {
                //         wx.showToast({
                //             title: '请求失败，请重试',
                //             icon: 'none'
                //         })
                //     }
                // }
                // else {
                //     wx.showToast({
                //         title: '请求失败，请重试',
                //         icon: 'none'
                //     })
                // }
            },
            fail: err => {
                wx.showToast({
                    title: '请求失败，请重试',
                    icon: 'none'
                })
            },
            complete: () => {

            }
        })
    },

    _fetchCatesData() {
        wx.request({
            url: 'https://uinav.com/api/public/v1/home/catitems',
            success: res => {
                // 接口返回200，同时接口的业务逻辑状态码也是200正常的情况；否则是非正常情况
                if (+res.statusCode === 200
                    && res.data && res.data.meta
                    && +res.data.meta.status === 200    
                ) {
                    this.setData({
                        cates: res.data.message
                    })
                }
                else {
                    wx.showToast({
                        title: '请求分类数据失败，请重试',
                        icon: 'none'
                    })
                }

                // 网络返回200
                // if (+res.statusCode === 200) {
                //     if (res.data && res.data.meta && +res.data.meta.status === 200) {
                //         this.setData({
                //             swiperData: res.data.message
                //         })
                //     }
                //     else {
                //         wx.showToast({
                //             title: '请求失败，请重试',
                //             icon: 'none'
                //         })
                //     }
                // }
                // else {
                //     wx.showToast({
                //         title: '请求失败，请重试',
                //         icon: 'none'
                //     })
                // }
            },
            fail: err => {
                wx.showToast({
                    title: '请求分类数据失败，请重试',
                    icon: 'none'
                })
            },
            complete: () => {

            }
        })
    },

    _fetchFloorData() {
        wx.request({
            url: 'https://uinav.com/api/public/v1/home/floordata',
            success: res => {
                // 接口返回200，同时接口的业务逻辑状态码也是200正常的情况；否则是非正常情况
                if (+res.statusCode === 200
                    && res.data && res.data.meta
                    && +res.data.meta.status === 200    
                ) {
                    this.setData({
                        floorData: res.data.message
                    })
                }
                else {
                    wx.showToast({
                        title: '请求楼层区域数据失败，请重试',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                wx.showToast({
                    title: '请求楼层区域数据失败，请重试',
                    icon: 'none'
                })
            },
            complete: () => {

            }
        })
    },

    _goCates() {
        wx.switchTab({url: '/pages/cates/cates'})
    },

    _goGoodsList(ev) {
        const {url} = ev.currentTarget.dataset

        wx.navigateTo({
            url: '/pages/goods_list/index' + url.slice(url.indexOf('?'))
        })
    }
})