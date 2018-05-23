<template>
  <div id="Linkage">
    <template v-for="(categories,index) in categoryLevels">
      <select v-model="categoryValues[index]" :key="index" @change="selectedCategory(index)" ref="select">
        <template v-for="(category, k) in categories" >
          <option :value="category" v-text="category.name" :key="k"></option>
        </template>
      </select>
    </template>
    <br/>
    <button @click="change">click me</button>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        categoryData: null,
        categoryLevels: [],
        categoryValues: [],
        curCate:182
      }
    },
    mounted () {
      this.init()
    },
    watch: {
      categoryData (value) {
        this.categoryLevels.push(value.filter(category => category.parent_id === 0))
      }
    },
    methods: {
      init () {
        this.categoryData = [
          {type_id: 1, parent_id: 0, name: '一级分类'},
          {type_id: 12, parent_id: 1, name: '二级分类1'},
          {type_id: 13, parent_id: 1, name: '二级分类2'},
          {type_id: 122, parent_id: 12, name: '三级分类1'},
          {type_id: 133, parent_id: 13, name: '三级分类2'},
          {type_id: 1335, parent_id: 133, name: '三级分类2'},
          {type_id: 1336, parent_id: 133, name: '三级分类2'},
        ]
      },
      selectedCategory (index) {
        this.curCate = this.$refs.select[0].value;
        this.categoryLevels.splice(index + 1, this.categoryLevels.length)
        this.categoryValues.splice(index + 1, this.categoryValues.length)
        this.categoryValues.forEach((selectedCategory, index) => {
          let categories = this.categoryData.filter(category => category.parent_id === selectedCategory.type_id)
          if (categories.length) {
            this.categoryLevels[index + 1] = categories
          }
        })
        console.info(this.categoryLevels)
      },
      change() {
        let _index = this.curCate
        console.info(_index)
      }
    }
  }
</script>

<style scoped>

</style>
