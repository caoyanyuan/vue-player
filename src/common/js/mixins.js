import {mapGetters, mapActions, mapMutations} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from "common/js/util";

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const searchMixin = {
  data() {
    return {
      query: "",
      refreshDelay: 120
    }
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    addQuery(item) {
      this.$refs.searchBox.addQuery(item)
    },
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
    ])
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode == playMode.sequence ? 'icon-sequence' : this.mode == playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'mode',
      'sequenceList',
      'currentSong',
      'playlist',
      'favoriteList'
    ])
  },
  methods: {
    changeMode() {
      let mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = ""
      if(mode == playMode.random) {
        list = shuffle(this.sequenceList)
      }else{
        list = this.sequenceList
      }
      this._resetCurrentIndex(list)
      this.setPlayList(list)
    },
    _resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id == this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getFavoriteIcon(song) {
      return this.isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    },
    toggleFavorite(song) {
      if(!this.isFavorite(song)){
        this.saveFavoriteList(song)
      }else {
        this.deleteFavoriteList(song)
      }
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}








