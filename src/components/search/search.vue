<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" ref="shortcut-wrapper" v-show="!query">
      <div class="shortcut">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li class="item" v-for="item in hotKey"><span>{{item.k}}</span></li>
          </ul>
        </div>
        <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
          </h1>
          <history-list :searches="searchHistory" @delete="deleteSearchHistory"></history-list>
        </div>
      </div>
    </div>
    <div class="search-result" v-show="query">
      <suggest :query="query" @select="saveSearch"></suggest>
    </div>
    <confirm text="确定删除全部历史吗？" ref="confirm" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import Confirm from 'base/confirm/confirm'
  import HistoryList from 'base/history-list/history-list'
  import Suggest from 'components/suggest/suggest'
  import SearchBox from 'base/search-box/search-box'
  import {getHotKey,search} from 'api/search'
  import {mapActions, mapGetters} from 'vuex'

  export default {
    data() {
      return {
        query:'',
        hotKey:[]
      }
    },
    methods: {
      showConfirm() {
        this.$refs.confirm.show()
      },
      saveSearch() {
        this.saveSearchHistory(this.query)
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
      ...mapGetters([
        'searchHistory'
      ])
    },
    mounted() {
      this._getHotKey()
    },
    components:{
      SearchBox, Suggest, HistoryList, Confirm
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
