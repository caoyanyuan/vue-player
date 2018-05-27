<template>
  <transition name="slider">
        <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {createSong} from 'common/js/song'
  import {getSingerDetail} from 'api/singer'
  import {mapGetters} from 'vuex'


  export default {
    data() {
      return {
        songs: []
      }
    },
    computed:{
      id(){
        return this.singer.id
      },
      title(){
        return this.singer.name
      },
      bgImage(){
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created(){
      console.info(this.singer)
      this._getDetail();
    },
    methods:{
      _getDetail(){
        if(!this.id){
          this.$router.push({
            path:'/singer'
          })
        }
        getSingerDetail(this.id).then((res) => {
          if(res.code === 0){
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if(musicData.songid && musicData.albummid){
              ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }

  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slider-enter-active, .slider-live-active
    transition:all .3s

  .slider-enter,.slider-leave-to
    transform: translate3d(100%, 0, 0)
</style>
