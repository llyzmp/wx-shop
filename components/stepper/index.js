/** ====================================================
 *   Copyright (C)2019 All rights reserved.
 *
 *   Author        : zuiwosuifeng
 *   Email         : zuiwosuifeng@gmail.com
 *   File Name     : index.js
 *   Last Modified : 2019-08-30 11:46
 *   Describe      : 步进器组件
 *   Params        : 数据项(至少有两个数据count和id, count标示初始数字，id标示数据项的身份)
 *   Params        : 回调事件[update], 用于在更新(加 减 输入)数据后通知父页面
 *
 * ====================================================*/

Component({
    properties: {
        // 传输过来商品数据
        goods: Object
    },
    methods: {
        // 对输入框过滤负数数字
        _input(ev) {
            const {id} = ev.currentTarget.dataset

            this.triggerEvent('update', {
                id,
                type: 'input',
                count: +ev.detail.value.replace(/-/ig, '') || ''
            })
        },
        // 处理输入框内容为空的情况 置为1
        _blur(ev) {
            const {id} = ev.currentTarget.dataset

            if (ev.detail.value === '') {
                this.triggerEvent('update', {
                    id,
                    type: 'input',
                    count: 1
                })
            }
        },
        // 更新数量
        _changeCounts(ev) {
            const {id, type} = ev.currentTarget.dataset

            // 如果是减少操作 不能是负数
            if (type === 'sub' && +this.properties.goods.count === 1) {
                wx.showToast({
                    title: '商品数量最小为1',
                    icon: 'none'
                })

                return false
            }

            let count = this.data.goods.count

            if (type === 'add') {
                count += 1
            }
            else if (type === 'sub') {
                count -= 1
            }

            this.triggerEvent(
                'update',
                {id, type, count}
            )
        }
    }
})
