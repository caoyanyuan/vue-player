<template>
  <scroll class="suggest" :data="result" :pullup=true @scrollToEnd="searchMore">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
        <div class="icon"><i :class="getIconCls(item)"></i></div>
        <div class="name">
          <p class="text" v-text="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper">
      <no-result title="没有搜索出结果" v-show="!hasMore && !result.length"></no-result>
    </div>
  </scroll>
</template>

<script>
  import NoResult from 'base/no-result/no-result'
  import Singer from 'common/js/singer'
  import Scroll from 'base/scroll/scroll'
  import {createSong} from 'common/js/song'
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import Loading from 'base/loading/loading'
  import {mapMutations,mapActions} from 'vuex'

  const perpage = 20
  const TYPE_SINGER = 'singer'

  export default {
    props: {
      query: {
        type: String,
        default: ""
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        page: 1,
        result: [],
        hasMore: true
      }
    },
    methods: {
      selectItem(item){
        if(item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singerid,
            name: item.singername
          })
          this.$router.push({
            path:`/search/${singer.id}`
          })
          this.set_singer(singer)
        }else{
          this.insertSong(item)
        }
      },
      searchMore(){
        if(!this.hasMore) {
         return
        }
        this.page++
        this.search(this.query)
      },
      searchFirst(){
        this.page = 1
        this.result = []
        this.hasMore = true
        this.search(this.query)
      },
      search(query) {
        search(query, this.page, this.showSinger, perpage).then((res) => {
          if(res.code === ERR_OK){
            this.result = this.result.concat(this._getResult(res.data))
            this._checkMored(res.data)
          }
        })
      },
      _checkMored(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      getIconCls(item){
        if(item.type === TYPE_SINGER){
          return 'icon-mine'
        }else{
          return 'icon-music'
        }
      },
      getDisplayName(item){
        if(item.type === TYPE_SINGER){
          return item.singername
        }else{
          return item.name+' - '+item.singer
        }
      },
      _getResult(data) {
        let ret=[]
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret=ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      _normalizeSongs(list) {
        const ret = []
        list.forEach((musicData) => {
          if(musicData.songid && musicData.albumid){
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      ...mapMutations({
        'set_singer':'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      query(newQuery){
        this.searchFirst(newQuery)
      }
    },
    components:{
      Scroll, Loading, NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
