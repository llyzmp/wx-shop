import './utils/lib.js'

App({
    globalData: {
        sysInfo: {},
        // 购物车数据
        cart: []
    },
    // onLaunch: async function () {
    async onLaunch() {
        // 获取系统信息 存储下供各页面使用
        this.globalData.sysInfo = wx.getSystemInfoSync()

        // 在小程序启动时 获取已经存储的购物车数据
        this.globalData.cart = wx.getStorageSync('cart') || []

        // 在小程序启动时 获取已经存储的收货地址数据
        this.globalData.address = wx.getStorageSync('address') || {}

        // 在小程序启动时 读取已经存储的token值
        this.globalData.token = wx.getStorageSync('token') || ''

        this._promisifyWxApi()

        // 在这里调用和在首页调用效果类似
        // this._setTabBarBadge()

        // 这是别人提供的一个功能函数，我们可以使用它的功能，但是不能修改这个函数
        // 我们又想在这个函数执行前后再加点自己的逻辑
        // 不影响后续的使用: 改造后对该函数的使用没有任何的影响
        function fn() {
            console.log('a')
        }

        // 改造过程描述
        // 1. 首先存储下原来的函数
        const originalFn = fn

        // 2. 重新定义该函数
        // 在新函数内部执行原函数：保障原函数的功能不会丢失
        // 在信函上内部添加自己的逻辑
        fn = function () {
            console.log('1')
            originalFn()
            console.log('2')
        }

        // 3. 照旧使用该函数即可
        fn()

        function Page() {
            console.log('a')
        }

        // 改造Page
        // 1. 首先存储下原来的函数
        // const originalFn = Page

        // Page = function () {
        //     console.log('1')
        //     originalFn()
        //     console.log('2')
        // }

        // Page()
    },

    // 设置购物车tab栏徽章
    _setTabBarBadge(cart) {
        cart = cart || this.globalData.cart

        wx.setTabBarBadge({
            index: 3,
            text: '' + cart.reduce((sum, it) => sum + (it.check ? it.count : 0), 0),
            fail: err => {
                console.log('set tabBar badge err: ', err)
            }
        })
    },

    // 持久化存储购物车数据到storage
    _storeCarts(cart) {
        // cart = cart || this.globalData.cart

        // 向购物车中新增商品 修改购物车商品数量 选中态，删除购物车商品都经过这个函数进行存储
        // 所以在这里根据最新的购物车数据进行徽章设置
        this._setTabBarBadge(cart)
    },

    onHide() {
        wx.setStorage({
            key: 'cart',
            data: this.globalData.cart
        })
    },

    // 调用收货地址接口可能出现的情况:
    // 1. 用户未同意过也未拒绝过，调起api出现弹层询问用户，如果用户选同意，则走suucess分支成功获取到收货地址,如果不同意走fail分支
    // 2. 用户已同意过，调用API直接走success分支
    // 3. 用户已拒绝过，调用API直接走fail分支

    // 对授权类接口的通用处理逻辑
    // 0. 获取用户的授权情况. 如果授权情况符合上述1 2的情况，直接调用API去获取
    // 1. 如果用户拒绝过，咱们需要调起设置界面（app原生界面）给用户进行权限设置
    // 2.1 在设置后，如果设置的结果是同意，那么再调API获取收货地址
    // 2.2 在设置后，如果设置的结果还是不同意，那么此时的处理逻辑: 给用户提示相关信息；或许提供一个页面供用户填写收货地址
    async _chooseAddress() {
        try {
            console.log('开始获取授权信息')
            // 0. 获取用户的授权情况
            let auth = await wx.getSettingAsync()

            console.log('auth: ', auth)
            // 1. 如果用户拒绝过此授权
            if (auth.authSetting['scope.address'] === false) {
                // 2. 打开app设置界面让用户选择授权与否
                let setting = await wx.openSettingAsync()

                console.log('settingg:', setting)
                // 2.1 用户在设置界面依然选择是拒绝
                if(setting.authSetting['scope.address'] === false) {
                    // 弹层提示或者提示后跳转到信息填写页面
                    wx.showToast({
                        title: '购买商品需要您的收货地址',
                        icon: 'none'
                    })

                    // wx.navigateTo({url: '/pages/addr/index'})
                }
                // 2.2 若用户同意 则走下面的调接口即可
            }

            let ret = await wx.chooseAddressAsync()

            // 持久化存储到storage中，后续打开页面时获取使用
            wx.setStorage({
                key: 'address',
                data: ret
            })

            return ret
        }
        catch(err) {
            console.log('err', err)
            wx.showToast({
                title: '购买商品需要您的收货地址',
                icon: 'none'
            })
        }
    },

    _promisifyWxApi() {
        const that = this

        wx.requestAsync = function (params={}) {
            const {url, method, data, header, hideLoading} = params
            
            // 在这里可以进行任意的请求拦截

            // 4. 如果有特殊情况不需要弹出loading提示，可以传递hideLoading参数，值为真
            if (!hideLoading) {
                wx.showLoading({title: '正在获取数据...'})
            }

            let formatParams = {}

            // 1. 统一对参数进行过滤，凡是值为undefined null的参数给过滤掉
            for(let prop in data) {
                // if (data[prop] === undefined || data[prop] === null) {
                //     delete data[prop]
                // }
                if (data[prop] !== undefined && data[prop] !== null) {
                    formatParams[prop] = data[prop]
                }
            }

            // 2. 假设对小程序的所有请求需要携带参数channel: miniapp
            // formatParams.channel = 'miniapp'

            return new Promise((resolve, reject) => {
                wx.request({
                    // 3. 统一进行url地址拼接
                    url: 'https://uinav.com/api/public/v1/' + url,
                    // url: 'https://www.zhengzhicheng.cn/api/public/v1/' + url,
                    method: method || 'GET',
                    data: formatParams,
                    header: {
                        ...header,
                        'Authorization': that.globalData.token
                    },
                    success: res => {
                        // 网络状态码是否是200
                        if (+res.statusCode === 200 && res.data && res.data.meta) {
                            // 接口业务逻辑正常
                            if (+res.data.meta.status === 200) {
                                resolve(res.data.message)
                            }
                            // 如果是401 404等错误，后续再扩展补充
                            // 比如说返回了401无权限错误，那么可以在这里统一处理为跳转到登录页面
                            else {
                                reject(res)
                            }
                        }
                        else {
                            wx.showToast({
                                title: '数据返回异常，请重试',
                                icon: 'none'
                            })
                        }
                    },
                    fail: err => {
                        reject(err)
                    },
                    complete: () => {
                        if (!hideLoading) {
                            wx.hideLoading()
                        }
                    }
                })
            })
        }

        wx.chooseAddressAsync = function() {
            return new Promise((resolve, reject) => {
                wx.chooseAddress({
                    success: res => {
                        resolve(res)
                    },
                    fail: err => {
                        reject(err)
                    }
                })
            })
        }
        // 获取授权情况
        wx.getSettingAsync = function () {
            return new Promise((resolve, reject) => {
                wx.getSetting({
                    success: res => {
                        resolve(res)
                    },
                    fail: err => {
                        reject(err)
                    }
                })
            })
        }
        // 打开原生app的权限设置界面
        wx.openSettingAsync = function () {
            return new Promise((resolve, reject) => {
                wx.openSetting({
                    success: res => {
                        resolve(res)
                    },
                    fail: err => {
                        reject(err)
                    }
                })
            })
        }

        // 获取登录code
        wx.loginAsync = function() {
            return new Promise((resolve, reject) => {
                wx.login({
                    success: res => {
                        resolve(res)
                    },
                    fail: err => {
                        reject(err)
                    }
                })
            })
        }

        // 小程序支付接口
        wx.requestPaymentAsync = function(params={}) {
            // cosnt {timeStamp, nonceStr, package, signType, paySign} = params
            return new Promise((resolve, reject) => {
                // wx.requestPayment({
                //     timeStamp,
                //     nonceStr,
                //     package,
                //     signType,
                //     paySign,
                //     success (res) {
                //         resolve(res)
                //     },
                //     fail (res) {
                //         reject(err)
                //     }
                // })

                wx.requestPayment({
                    ...params,
                    success (res) {
                        resolve(res)
                    },
                    fail (err) {
                        reject(err)
                    }
                })
            })
        }
    },

    async _wxRequest2Promise() {
        // 直接调接口
        wx.request({
            url: 'https://uinav.com/api/public/v1/home/swiperdata',
            success: res => {
                console.log('app res: ', res)
            }
        })

        // 将该接口封装成promise

        const swip = new Promise((resolve, reject) => {
            wx.request({
                url: 'https://uinav.com/api/public/v1/home/swiperdata',
                success: res => {
                    resolve(res)
                },
                fail: err => {
                    reject(err)
                }
            })
        })

        // swip.then(res => {
        //     console.log('success: ', res)
        // })
        // .catch(err => {
        //     console.log('异步操作失败了: ', err)
        // })

        // try...catch不但能够捕获同步错误，也能捕获异步操作
        try {
            let ret = await swip

            console.log('ret: ', ret)
        }
        catch(err) {
            console.log('操作失败了: ', err)
        }

        // 2. 适配所有的接口，把任意的接口都封装成一个promise，进而使用async await语法
        function asyncRequest(params={}) {
            const {url, method, data, header} = params

            return new Promise((resolve, reject) => {
                wx.request({
                    url,
                    method: method || 'GET',
                    data,
                    header,
                    success: res => {
                        resolve(res)
                    },
                    fail: err => {
                        reject(err)
                    }
                })
            })
        }

        wx.requestAsync = asyncRequest

        try {
            let ret = await asyncRequest({
                url: 'https://uinav.com/api/public/v1/home/floordata'
            })

            console.log('swiper 接口返回的数据', ret)
        }
        catch(err) {
            console.log('swiper 接口报错', ret)
        }
    },

    _setTimeout2Promise() {
        // promise: 承诺
        // 1. pending: 等待
        // 2. fulfilled 成功(经常使用resolve来表述成功)
        // 3. rejected 失败
        new Promise(function (resolve, reject) {
            // 如果将来做的事情成功了 执行resolve
            // 如果将来做的事情失败了 执行reject
            // if (success) {
            //     resolve()
            // }
            // else {
            //     reject()
            // }
        })


        // 3秒后打印log: a
        // setTimeout(
        //     () => {
        //         console.log('a')
        //         setTimeout(
        //             () => {
        //                 console.log('b')
        //             },
        //             2000
        //         )
        //     },
        //     3000
        // )

        // setTimeout => promsie
        function abc(ts) {
            return new Promise((resolve, reject) => {
                setTimeout(
                    () => {
                        resolve()
                    },
                    ts
                )
            })
        }
        

        // 使用promise链式调用
        // abc(3000)
        // .then(() => {
        //     console.log('a')
        //     return abc(2000)
        // })
        // .then(() => {
        //     console.log('b')
        // })
        // .catch(err => {})

        // 使用async await配置promise使用
        // await abc(3000)
        // console.log('a')
        // await abc(2000)
        // console.log('b')
    }
})