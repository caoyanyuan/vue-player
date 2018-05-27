<template>
  <transition name="slider">
    woshi
      <music-list :title="title" :bgImage="bgImage" :songs="song"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {getSongList} from 'api/recommend'
  import ERR_OK from 'api/config'
  import {mapGetters} from 'vuex'

  export default {
      computed: {
        ...mapGetters([
          'sheet'
        ]),
        title() {
          return this.sheet.dissname
        },
        bgImage() {
          return this.sheet.imgurl
        }
      },
      data() {
        return {
          song: []
        }
      },
      methods: {
        _getSongList(){
          if(!this.sheet.dissid) {
            this.$router.push('/recommend')
          }
          getSongList(this.sheet.dissid).then((res) => {
            if(res.code === ERR_OK){
              console.info(res)
            }

          })
        }
      },
      created() {
        this._getSongList()
      },
      components: {
        MusicList
      }
  }
</script>

<style scoped>

</style>
