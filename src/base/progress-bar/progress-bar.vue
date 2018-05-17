<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')
  const BTN_WIDTH = 16

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {}
      this.bar_width = ""
    },
    methods: {
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      progressTouchStart(e) {
        this.touch.startX = e.touches[0].clientX
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
        let delta = e.touches[0].clientX - this.touch.startX
        let offsetWidth = this.touch.left + delta
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this._triggerPercent()
      },
      _triggerPercent() {
        let percent = this.$refs.progress.clientWidth / this.bar_width;
        this.$emit('changePercent',percent)
      },
      _offset(width) {
        this.$refs.progress.style.width = `${width}px`
        this.$refs.progressBtn.style[transform] = `translateX(${width}px)`
      }
    },
    watch: {
      percent(newPercent) {
        this.bar_width = this.$refs.progressBar.clientWidth - BTN_WIDTH
        this._offset(this.bar_width * newPercent)
      }
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
