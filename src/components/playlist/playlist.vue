<template>
  <transition name="list-fade">
    <div class="playlist" @click="hide" v-show="showFlag">
      <div class="list-wrapper">
        <div class="list-header">
          <h1 class="title" @click.stop="changeMode">
            <i class="icon" :class="iconMode"></i>
            <span class="text">{{iconModeText}}</span>
            <span class="clear" @click.stop="confirmClear"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll class="list-content" ref="listContent" :data="sequenceList">
            <transition-group tag="ul" name="list" ref="listItem">
              <li :key="item.id" class="item" v-for="(item,index) in sequenceList" @click.stop="selectItem(item, index)">
                <i class="current" :class="getCurrentIcon(item)"></i>
                <span class="text">{{item.name}}</span>
                <span @click.stop="toggleFavorite(item)" class="like">
                  <i :class="getFavoriteIcon(item)"></i>
                </span>
                <span class="delete" @click.stop="deleteItem(item)">
                  <i class="icon-delete"></i>
                </span>
              </li>
            </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click.stop="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div @click="hide" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <confirm text="是否清空全部列表" @confirm="deleteAll" ref="confirm"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import AddSong from 'components/add-song/add-song'
  import Confirm from 'base/confirm/confirm'
  import Scroll from 'base/scroll/scroll'
  import {playMode} from 'common/js/config'
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import {playerMixin} from "common/js/mixins"

  export default {
    mixins: [playerMixin],
    data() {
      return {
        showFlag: false
      }
    },
    methods: {
      addSong() {
        this.$refs.addSong.show()
      },
      confirmClear() {
        this.$refs.confirm.show()
      },
      deleteAll() {
        this.deleteAllSong()
        this.showFlag = false
      },
      deleteItem(item) {
        this.deleteSong(item)
      },
      selectItem(item, index) {
        if(this.mode === playMode.random) {
          index = this.playlist.findIndex((list) => {
            return list.id === item.id
          })
        }
        this.setCurrentIndex(index)
      },
      scrollToCurrent(current) {
        let index = this.sequenceList.findIndex((list) => {
          return list.id === current.id
        })
        this.$refs.listContent.scrollToElement(this.$refs.listItem.$el.children[index],300)
      },
      getCurrentIcon(item) {
        return item.id == this.currentSong.id ? 'icon-play' : null
      },
      hide() {
        this.showFlag = false
      },
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      ...mapMutations({
        'setCurrentIndex':'SET_CURRENT_INDEX'
      }),
      ...mapActions([
        'deleteSong',
        'deleteAllSong'
      ])
    },
    computed: {
      iconModeText() {
        return this.mode == playMode.sequence ? '顺序播放' : this.mode == playMode.loop ? '循环播放' : '随机播放'
      }
    },
    watch: {
      currentSong(newSong, oldSong) {
        if(!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        setTimeout(() => {
          this.scrollToCurrent(newSong)
        }, 20)
      }
    },
    components:{
      Scroll, Confirm, AddSong
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
