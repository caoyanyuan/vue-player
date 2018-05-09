<template>
  <div>

  </div>
</template>

<script type="text/ecmascript-6">
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
      ...mapGetters([
        'singer'
      ])
    },
    created(){
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
        console.info(ret)
        return ret
      }
    }

  }
</script>

