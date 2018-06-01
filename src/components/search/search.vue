<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box @query="onQueryChange" ref="searchBox"></search-box>
    </div>
    <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query" :refreshDelay="refreshDelay">
      <scroll class="shortcut"  ref="shortcut" :data="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="item in hotKey" @click="addQuery(item.k)"><span>{{item.k}}</span></li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
                <span @click="showConfirm" class="clear">
                  <i class="icon-clear"></i>
                </span>
            </h1>
            <history-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></history-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest :query="query" @select="saveSearch" ref="suggest" @listScroll="blurInput"></suggest>
    </div>
    <confirm text="确定删除全部历史吗？" ref="confirm" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Confirm from 'base/confirm/confirm'
  import HistoryList from 'base/history-list/history-list'
  import Suggest from 'components/suggest/suggest'
  import SearchBox from 'base/search-box/search-box'
  import {getHotKey,search} from 'api/search'
  import {mapActions, mapGetters} from 'vuex'
  import {playlistMixin} from 'common/js/mixins'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        query: '',
        hotKey: [],
        refreshDelay: 120
      }
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length ? '60px' : 0
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()
      },
      blurInput() {
        this.$refs.searchBox.blur()
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      saveSearch() {
        this.saveSearchHistory(this.query)
      },
      addQuery(item) {
        this.$refs.searchBox.addQuery(item)
      },
      onQueryChange(query) {
        this.query = query
      },
      _getHotKey() {
        getHotKey(this.query).then((res) => {
          this.hotKey = res.data.hotkey.slice(0, 10)
        })
      },
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory'
      ])
    },
    computed: {
      shortcut() {
        return this.hotKey.concat(this.searchHistory)
      },
      ...mapGetters([
        'searchHistory'
      ])
    },
    watch: {
      query(newQuery){
        if(!newQuery){
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    mounted() {
      this._getHotKey()
    },
    components:{
      SearchBox, Suggest, HistoryList, Confirm, Scroll
    }
  }

</script>


<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
