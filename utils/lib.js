// 1. 把原来的Page构造函数存储下来
const originalPage = Page

// options是页面构造函数的配置对象
Page = function (options) {
    // 存储下options的onShow函数
    const originalOnShow = options.onShow || function() {}

    // 改造onShow
    options.onShow = function () {
        originalOnShow.call(this)

        // 这里统一执行 设置徽章
        const app = getApp()

        app._setTabBarBadge()

        console.log('---global onshow')
    }

    originalPage.call(this, options)
}