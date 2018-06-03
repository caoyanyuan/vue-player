<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click.stop="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
       <search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switch-tab :switches="switches" :currentIndex="switchesIndex" @switch="switchTab"></switch-tab>
        <div class="list-wrapper">
          <scroll ref="songList" v-if="switchesIndex===0" class="list-scroll" :data="playHistory">
            <div class="list-inner">
              <song-list @selected="selectSong" :songs="playHistory">
              </song-list>
            </div>
          </scroll>
          <scroll  ref="historyList" v-if="switchesIndex===1" class="list-scroll"
                  :data="searchHistory" :refreshDelay="refreshDelay">
            <div class="list-inner">
              <history-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></history-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
         <suggest :query="query" :showSinger="showSinger" @listScroll="blurInput" @select="selectSuggest"></suggest>
       </div>
      <top-tip ref="topTip">
          <div class="tip-title">
            <i class="icon-ok"></i>
            <span class="text">1首歌曲已经添加到播放列表</span>
          </div>
        </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import TopTip from 'base/top-tip/top-tip'
  import SongList from 'base/song-list/song-list'
  import SwitchTab from 'base/switch-tab/switch-tab'
  import HistoryList from 'base/history-list/history-list'
  import Suggest from 'components/suggest/suggest'
  import Scroll from 'base/scroll/scroll'
  import SearchBox from 'base/search-box/search-box'
  import Song from 'common/js/song'
  import {searchMixin} from 'common/js/mixins'
  import {mapActions, mapGetters} from 'vuex'

  export default {
    mixins:[searchMixin],
    data() {
      return {
        showFlag: false,
        showSinger: false,
        switches: [
          {
            name: '播放历史'
          },
          {
            name: '搜索历史'
          }
        ],
        switchesIndex: 0
      }
    },
    methods: {
      selectSong(song, index) {
        if(index !== 0){
          this.insertSong(new Song(song))
          this.$refs.topTip.show()
        }
      },
      switchTab(index) {
        this.switchesIndex = index
      },
      selectSuggest() {
        this.saveSearchHistory(this.query)
        this.$refs.topTip.show()
      },
      show() {
        this.showFlag = true
        if(this.switchesIndex === 0){
          setTimeout(() => {
            this.$refs.songList.refresh()
          }, 20)
        }else{
          setTimeout(() => {
            this.$refs.historyList.refresh()
          }, 20)
        }
      },
      hide() {
        this.showFlag = false
      },
      ...mapActions([
        'saveSearchHistory',
        'insertSong'
      ])
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    components: {
      SearchBox, Scroll, HistoryList, Suggest ,SwitchTab, SongList, TopTip
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
