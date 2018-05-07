<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <router-view/>
  </div>
</template>

<script type="text/ecmascript-6">
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'

export default{
  name: 'App',
  components: {
    MHeader,
    Tab
  }
}
</script>

<style>

</style>
