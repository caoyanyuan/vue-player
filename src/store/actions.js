import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function({commit, state},{list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()                  //使用slice拿到数据的拓本
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  //记录当前歌曲
  let currentSong = playlist[currentIndex]
  //查找当前列表中是否已经存在有待插入的歌曲，有则返回索引
  let fpIndex = findIndex(playlist, song)
  //在当前index之后插入歌曲
  currentIndex++
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌
  if (fpIndex > -1){
    // 如果当前插入的序号大于列表中的序号
    if(currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    }else{
      playlist.splice(fpIndex+1, 1)
    }
  }

  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let spIndex = findIndex(playlist, song)
  sequenceList.splice(currentSIndex, 0, song)
  if(spIndex > -1) {
     if(currentSIndex > spIndex){
       sequenceList.splice(spIndex, 1)
     }else{
       sequenceList.splice(spIndex + 1, 1)
     }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)

}

export function saveSearchHistory({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export function deleteSearchHistory({commit}, history) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(history))
}

export function clearSearchHistory({commit}){
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export function deleteSong({commit, state}, song){
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  let fpIndex = findIndex(playlist, song)
  playlist.splice(fpIndex, 1)
  let sqIndex = findIndex(sequenceList, song)
  sequenceList.splice(sqIndex, 1)

  if(fpIndex < currentIndex || currentIndex === playlist.length - 1 ){
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAYING_STATE, playlist.length > 0 ? true : false)
}

export function deleteAllSong({commit}) {
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_PLAYING_STATE, false)
}

