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










