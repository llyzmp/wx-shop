/** ====================================================
 *   Copyright (C)2019 All rights reserved.
 *
 *   Author        : zuiwosuifeng
 *   Email         : zuiwosuifeng@gmail.com
 *   File Name     : index.js
 *   Last Modified : 2019-08-30 12:30
 *   Describe      : 利用movable-view实现左滑删除, 还可以利用touch事件实现删除
 *   Params        : 内容slot='content' 与 删除按钮slot='delete'
 *
 * ====================================================*/

Component({
    options: {
        multipleSlots: true
    },
    data: {
        x: 0
    },
    methods: {
        // 监听滑动过程进行处理
        _movableChange(ev) {
            const {source, x} = ev.detail

            // 惯性滑动的距离大于一半则完整显示 否则回退隐藏
            if (source === 'friction') {
                if (x < -30) {
                    this._setMoveX(-65)
                }
                else {
                    this._setMoveX(0)
                }
            }
            else if (source === 'out-of-bounds' && x >= 0) {
                this._setMoveX(0)
            }
        },
        // 手指开始触摸
        _touchStart(ev) {
            this.startX = ev.touches[0].pageX
            this.startY = ev.touches[0].pageY
        },
        // 结束手指触摸
        // 针对用户斜滑操作，如果超过30度则认为是下滑，不触发[左滑出现删除按钮]交互
        _touchEnd(ev) {
            const {startX, startY} = this
            const {pageX, pageY} = ev.changedTouches[0]
            const {id} = ev.currentTarget.dataset

            const angle = this._angle({X:startX, Y:startY}, {X:pageX, Y:pageY})

            if (Math.abs(angle) > 30) {
                return false
            }

            if (pageX < startX && pageX - startX <= -30) {
                this._setMoveX(-65)
            }
            else if (pageX > startX && pageX - startX < 30) {
                this._setMoveX(-65)
            }
            else {
                this._setMoveX(0)
            }
        },
        // 根据余切求角度 角度 = cot(y/x) * 180 / Math.PI
        _angle(start, end) {
            const X = end.X - start.X
            const Y = end.Y - start.Y

            return 360 * Math.atan(Y / X) / (2 * Math.PI)
        },
        // 设置该项的movable-view移动距离
        _setMoveX(distance) {
            this.setData({
                x: distance
            })
        }
    }
})
