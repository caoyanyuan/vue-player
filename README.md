## 一、项目说明
该播放器的是基于学习vue的实站练习，不用于其他途径。应用中的全部数据来远于 QQ音乐 移动端（https://m.y.qq.com/），利用 jsonp 以及 axios 代理后端请求抓取。
## 二、目录结构
| 目录/文件 | 说明 | 
| ------------- |:-------------:|
| api |与后台数据交互文件 |
| base | 一些与业务逻辑无关的基础组件，例如轮播图：slider组件 |
| common | 存放图片，字体，样式，以及js插件等公共资源 | 
| components |业务逻辑代码| 
| router | 项目路由 | 
| store | vuex状态管理配置| 
##三、base组件
###1、轮播图slider
> 引入组件 better-scroll

1.1、参数设置
    loop:是否循环播放
    autoPlay：是否自动播放
    interval:自动播放的间隔时间
2.1、实现
    (1).需要通过获取slider的宽度来设置每一个轮播图和轮播图的包裹层的宽度
	(2).初始化better-scroll实例
    若设置 loop为true 会自动 clone 两个轮播插在前后位置,如果轮播循环播放，是前后各加一个轮播   图保证无缝切换，所以需要再加两个宽度
```
if (this.loop) {
  width += 2 * sliderWidth
}
```
(3). 给slider绑定’scrollEnd‘事件，来获取当前滚动值currentPageIndex
(4).dots小圆点的active状态。通过currentPageIndex === index 来判断
(5).为了保证改变窗口大小依然正常轮播，监听窗口 resize 事件，通过better-scroll提供的refresh()重新渲染轮播图
```
window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        this.slider.refresh()
    })
 }
```
(6)在组件销毁之前 beforeDestroy 销毁定时器
### 2 播放进度条组件 
#### 2.1 全屏下  条状滚动条progeress-bar
1. 参数设置
    percent：显示当前播放进度
2. 实现
a. 拖拽按钮时候：监听touchstart，touchmove，touchend事件
     touchstart： 获取第一次点击的横坐标clinetX：startX，已经progress的clientWidth：left。
    touchmove：获取移动后的横坐标，计算对应的delta，此时进度条的位置 = clinetWidth+delta
    touchend：派发出percent。从而改变progress的width
```
 progressTouchStart(e) {
        this.touch.startX = e.touches[0].clientX
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
        let delta = e.touches[0].clientX - this.touch.startX
        let offsetWidth = this.touch.left + delta
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this._triggerPercent()
      },
```
b. 点击时候：也是通过点击的位置计算出progress的宽度。
```
progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
```
注：getBoundingClientRect用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置。 
getBoundingClientRect是DOM元素到浏览器可视范围的距离（不包含文档卷起的部分），
该函数返回一个Object对象，该对象有6个属性：top,lef,right,bottom,width,height；
#### 2.1  mini  圆形滚动条progeress-circle
1. 参数
radius：设置圆形的直径
percent：当前进度
2. 实现
圆形采用svg，中有两个圆，一个是背景圆形，另一个为已播放的圆形进度，圆形进度主要用了stroke-dasharray（描边距离） 和stroke-dashoffset（描边偏移距离） 两个属性的设置来显示对应进度变化
```
<svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
```
viewBox = 0 0 100 100 100 是相对于svg里面的设置 
传入radius为32：   100 =》直径  32
r = 50 ：50 =》半径 16
stroke-dasharray ： 描边距离 （这里对应为 math.PI * 100）
stroke-dashoffset： 描边偏移距离 (设置为 314，则偏移了314，这个圆就没有了。设置为0 ，这个圆完全显示)
```
    computed: {
      dashOffset() {  
        return (1 - this.percent) * this.dashArray          //只需根据percent来stroke-dashoffset即可显示进度
      }
    }
```


##四、api拿后端数据
组件中的数据全都是拿了qq音乐网页版的数据，拿数据的方式有两种，一种可以直接通过jsonp跨域来获取的，另一种接口通过referer伪造请求，
1.jsonp方式
在common中，封装一个公用jsonp方法
```
import originJsonp from 'jsonp'

export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}
```
2.伪造请求
一些接口在后台简单设置一下 Referer, Host，可以限制前台直接通过浏览器抓到你的接口，但是这种方式防不了后端代理的方式，前端 XHR 会有跨域限制，后端发送 http 请求则没有限制，因此可以伪造请求
vue提供的axios可以在浏览器端发送 XMLHttpRequest 请求，在服务器端发送 http 请求获取；
在webpack.dev.config中配置如下
```
var express = require('express')
var axios = require('axios')
var app = express()
var apiRoutes = express.Router()
before(apiRoutes){
      apiRoutes.get('/api/getDiscList',(req,res)=>{
        const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query  //这是请求的query
        }).then((response) => {
          //response是url地址返回的，数据在data里。
          res.json(response.data)
        }).catch((e) => {
          console.log(e);
        })
      });
       app.use('/api', apiRoutes);
    },
}
```
定义一个路由，拿到一个 /api/getDiscList 接口，通过 axios 伪造 headers，发送给QQ音乐服务器一个 http 请求，得到服务端正确的响应，通过 res.json(response.data) 返回到浏览器端；
注意：此时的这个接口返回的格式已经是json，应该设置format：json
那么问题来了，大公司怎么防止被恶意代理呢？当你的访问量大的时候，出口ip就会可能被查到获取封禁，还有一种方式就是参数验签，也就是请求人家的数据必须带一个签名参数，然后这个签名参数是很难拿到的这个正确的签名，从而达到保护数据的目的；
##五、components业务逻辑代码
### 1、推荐页面
Scroll 初始化但却没有滚动，是因为初始化时机不对，必须保证数据到来，DOM 成功渲染之后 再去进行初始化
可以使用父组件 给 Scrol组件传 :data 数据，Scroll 组件自己 watch 这个 data，有变化就立刻 refesh 滚动
对应图片可以通过监听onload事件，来进行滚动刷新
```
<img @load="loadImage" class="needsclick" :src="item.picUrl">
loadImage() {
  if (!this.checkloaded) {
    this.checkloaded = true
    this.$refs.scroll.refresh()
  }
}
```
**新版本 BScroll 已经自己实现检测 DOM 变化，自动刷新，大部分场景下无需传 data 了**
### 2、歌手页面
#### 2.1、数据重构 
歌手页面的结构是 热门、 A-Z 的顺序排列，我们这里只抓取100条数据，观察其数据是乱序的，但我们可以利用数据的 Findex 进行数据的重构
1.首先可以定义一个 map 结构
```
let map = {
  hot: {
    title: HOT_NAME,
    item: []
  }
}
```
接着遍历得到的数据，将前10条添加到热门 hot 里
然后查看每条的 Findex ，如果 map[Findex] 没有，创建 map[Findex] push 进新条目，如果 map[Findex] 有，则向其 push 进新条目
```
list.forEach((item, index) => {
  if (index < HOT_SINGER_LEN) {
    map.hot.item.push(new SingerFormat({
      id: item.Fsinger_mid,
      name: item.Fsinger_name,
    }))
  }
  const key = item.Findex
  if (!map[key]) {
    map[key] = {
      title: key,
      items: []
    }
  }
  map[key].items.push(new SingerFormat({
    id: item.Fsinger_mid,
    name: item.Fsinger_name
  }))
})
```
这样就得到了一个 符合我们基本预期的 map 结构，但是因为 map 是一个对象，数据是乱序的，Chrome 控制台在展示的时候会对 key 做排序，但实际上我们代码并没有做。
所以还要将其进行排序，这里会用到 数组的 sort 方法，所以我们要先把 map对象 转为 数组
```
let hot = []
let ret = []
let un = []
for (let key in map) {
  let val = map[key]
  if (val.title.match(/[a-zA-z]/)) {
    ret.push(val)
  } else if (val.title === HOT_NAME) {
    hot.push(val)
  } else {
    un.push(val)
  }
}
ret.sort((a, b) => {
  return a.title.charCodeAt(0) - b.title.charCodeAt(0)
})
return hot.concat(ret, un)
```
这样就拿到一个类似[hot,a,b,c.......]这样符合需求的按规律排的数组。
#### 2.2、锚点操作控制主区块列表
实现效果：点击或滑动 shortcut 不同的锚点 ，自动滚动至相应的标题列表
实现思维：获得每一次操作shortcut上对应的index，想办法通过index来设置左边区块的滚动值
1.如何获得index值
a.点击时候：循环的时候将给dom绑上data-index属性，写上当前index。点击时候通过DOM操作获取（e.target对象的getAttribute）
b.滑动时候：第一次点击触碰 shortcut ，记录触碰位置的 index，y坐标值，在touchmove事件中拿到第二次触碰shortcut的y坐标值y2，将两次触碰的位置的差值处理成索引上的 delta 差值，从而可以拿到第二次触碰的index值。
2.怎么通过index设置滚动值
利用BScroll的scrollToElement可以设置content滚动到某个DOM位置
```
scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
```
通过index值可以知道当前content应该滚动到第几个标题列表里面
```
 _scrollTo(index) {
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) //listgroup代表左边标题区块
      }
```
#### 2.3、滑动主列表控制锚点
实现效果：滑动主列表，侧边 shortcut 自动高亮不同锚点
实现思维：实时监听主列表的滑动事件，得到每次滑动的值scrollY，设计一个listHeight数组存放每一个主列表到浏览器顶端的距离，比对scrollY存放在哪个listHeight的区间中得到currentIndex数值，这个currentIndex就对应着shortcut需高亮的锚点
1.scrollY的获取
a.获取滚动值：添加参数“listenScroll”来设置是否实时监听content的滚动事件，并向父组件派发事件scroll传出当前的滚动值：pos.y 
```
if (this.listenScroll) {
  let me = this
  this.scroll.on('scroll', (pos) => {   // 实时监测滚动事件，派发事件：Y轴距离
    me.$emit('scroll', pos)
  })
}
```
b.父组件监听到滚动派发的事件,并将值存入scrollY
```
@scroll="scroll"                      //template调用组件时绑定
scroll(pos) {                            
  this.scrollY = pos.y    // 实时获取 BScroll 滚动的 Y轴距离
}
```

2.listHeight的设计实现
```
 _calculateHeight(){
        const lists = this.$refs.listGroup                 //listGroup为主列表区块
        let height = 0;
        this.listHeight.push(height)
        for(let i=0; i<lists.length; i++){
          height += lists[i].clientHeight
          this.listHeight.push(height)
        }
      },
```
3、通过实时watch scrollY的值，比对listHeight,拿到当前content滚动值落在哪个区间，也就拿到了currentIndex
```
scrollY(newY){                                    //获取的浏览器滚动的值均为负数
        const listHeight = this.listHeight
        if(newY > 0){                     //当滚动到屏幕顶部时
          newY = 0
          return
        }
        for (let i = 0; i < listHeight.length - 1; i++){
          let hei_1 = listHeight[i]
          let hei_2 = listHeight[i+1]
          if(-newY >= hei_1 && -newY < hei_2){                 
            this.currentIndex = i;                           //currentIndex值是定义锚点高亮的值
            this.diff = hei_2 + newY
            return
          }
        }
      },
```

ps：vue用法小记：watch 的 scrollY(newY){}
1.当我们在 Vue 里修改了在 data 里定义的变量，就会触发这个变量的 setter，经过vue的封装处理，会触发 watch 的回调函数，也就是 scrollY(newY) {} 这里的函数会执行，同时，newY 就是我们修改后的值。
2.scrollY 是定义在 data 里的，列表滚动的时候，scroll 事件的回调函数里有修改 this.scrollY，所以能 watch 到它的变化。

#### 2.4 滚动固定标题
实现效果：主列表顶端固定一个标题，显示当前滚动的列表标题，标题改变时有transform上移效果
实现思维：固定标题fixedTitle拿到当前滚动数组中的title数据即可，在主列表的滚动事件中。设计一个diff值：存入每个区块的高度上限（也就是底部）减去 Y轴偏移的值，实时监听diff，当diff小于title块的高度时候，开始上移效果
1.fixedTitle获取
```
fixedTitle() {             //computed中设置
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
```
2.diff设置和监听
```
this.diff = hei_2 + newY                      //hei_2为即将滚动到下一个listGroup的高度
 diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0 ;  //TITLE_HEIGHT 为title块的高度：30
        if (this.fixedTop === fixedTop) {       //设定this.fixedTop的值存入fixedTop值。若滚动过程中fixedTop没有发生变化就不进行transform设置。减少DOM操作，
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
```
###3、歌手详情页 
歌手详情页是在歌手页singer跳转至二级路由页 singer-detail
index.js 路由里配置
```
{
  path: '/singer',
  component: Singer,
  children: [
    {
      path: ':id', // 表示 id 为变量
      component: SingerDetail
    }
  ]
}
```
在singer页面里面跳转路由设定
```
selectSinger(singer){
  this.$router.push({
    path: `/singer/${singer.id}`
  })
}
```
#### 3.1、vuex 
由于歌手详情页这个组件在app中有多次调用，这里设计到‘多个组件共享状态’的问题。故采用vuex状态管理，本项目简要介绍如下，具体移步 [vuex](https://vuex.vuejs.org/zh-cn/intro.html)： 
通常的流程为：
- 定义 state，考虑项目需要的原始数据（最好为底层数据）
- getters，就是对原始数据的一层映射，可以只为底层数据做一个访问代理，也可以根据底层数据映射为新的计算数据（相当于 vuex 的计算属性）
- 修改数据：mutations，定义如何修改数据的逻辑（本质是函数），在定义 mutations 之前 要先定义 mutation-types 
actions.js 通常是两种操作
- 异步操作
- 是对mutation的封装，比如一个动作需要触发多个mutation的时候，就可以把多个mutation封装到一个action中，达到调用一个action去修改多个mutation的目的。
##### 3.1.1、歌手详情页关于vuex的设置
a.state.js：创建singer对象
```
const state = {
  singer: {},
}
export default state
```
b.getter.js：对singer对象设置映射
```
export const singer = state => state.singer
```
c.mutation-types.js：设置singer可以修改的type值
```
export const SET_SINGER = 'SET_SINGER'
```
D.mutation.js：写入修改singer的函数
```
import * as types from './mutation-types'

const mutations = {
  [types.SET_SINGER](state, singer){
    state.singer = singer
  }
}

export default mutations
```
e:index.js：实现vuex配置
```
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex)
//非生产模式下开启debug
const debug = process.env.NODE_ENV !== 'production'
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
```
#### 3.2、利用vuex进行数据传递
实现效果：在singer页面点击进入singer-detai页面。传入歌手信息。显示歌手详情
实现思维：在singer组件跳转路由的时候，将当前点击的歌手信息写入singer的state状态中

1. 首先 listview.vue 检测点击事件，将具体点击的歌手派发出去，以供父组件 singer 监听
```
selectItem(item) {
  this.$emit('select', item)               //item即为歌手数据
},
```
2. 父组件监听事件执行 selectSinger(singer)
```
selectSinger(singer) {
  this.$router.push({
    path: `/singer/${singer.id}`
  })
  this.setSinger(singer)
},

...mapMutations({           /语法糖，'...'将多个对象注入当前对象
  setSinger: 'SET_SINGER'            // 将 this.setSinger() 映射为 this.$store.commit('SET_SINGER')
})
```
mapMutation为vuex提供的语法糖，获取所有的mutation
3. singer-detail 取 vuex 中存好的数据
```
computed: {
  ...mapGetters([         // 将 this.singer映射为 this.$store.getter.singer
    'singer'
  ])
}
```
mapGetters为vuex提供的语法糖，获取所有的getters
#### 3.3、music-list
实现效果：歌手详情页的歌单主要实现了歌单向上滚动时，这个歌单也跟着滚动上去，且背景图逐渐变得灰暗，歌单向下滚动时，背景图逐渐清晰，放大，
实现思维：主要是监听歌单的滚动事件，拿到各个变化的点
1、通过实时获取的scrollY与背景图片的比值。从而得到图片放大的比例，以及图片模糊的opacity值
```
scrollY(newY){
        let translateY = Math.max(this.minTranslateY, newY)   //设置minTranslateY值，用来限制歌单只能滚动到离顶部一段距离  this.minTranslateY = -this.imgHeight + RESERVE_HEIGHT（40）
        let zIndex = 0           //滚动过程中需要有层级的切换
        let scale = 1      
        let blur = 1
        const percent = Math.abs(newY / this.imgHeight)
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.max(0.2, 1-percent)
        }
        this.$refs.bgLayer.style['transform'] = `translate3d(0, ${translateY}px,0)`
        this.$refs.bgImage.style['opacity'] = `${blur}`
        if(newY < translateY){
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVE_HEIGHT}px`
          zIndex = 10
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
        }
        this.$refs.bgImage.style['transform'] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex
      }
```
此操作中涉及到css的transform的设置。考虑到浏览器对其兼容性不一，封装一个prefixStyle自动加上浏览器对应的前缀
```
let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) return key
  }
  return false
})()

export function prefixStyle(style) {
  if (vendor === false) return false
  if (vendor === 'standard') return style
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
```
###4、播放器 player组件
播放器是本次实战的难点及重点，把播放器组件放在 App.vue 下，因为它是一个跟任何路由都不相关的东西。在任何路由下，它都可以去播放。切换路由并不会影响播放器的播放。
#### 4.1 vuex设计
由于点击 详情页，以及搜索等 都可以进行播放歌曲，且播放组件在哪一个路由下都存在，故对其相关状态进行vuex管理
```
  playing: false,                    //当前是否正在播放
  fullScreen: false,               //全屏属性
  playlist: [],                         //为实现下一首，上一首功能，保存当前播放列表
  sequenceList: [],                //当前按正常顺序的列表，列表还有一种随机列表
  mode: playMode.sequence,    //播放模式。其三种放到配置文件config中
  currentIndex: -1              //当前歌曲的index
```
#### 4.2 展开收起动画
 全屏和底部之间的切换加上一些动画切换效果，引入插件‘create-keyframe-animation’
实现效果：该动画是点到点之间位移且慢慢放大的缩放效果
实现思维：获取两个点的位置，利用css3的translate3d属性进行位移和scale的设置，结合transition提供动画的四个钩子函数（@enter,@after-enter,@leave,@after-leave）以及插件create-keyframe-animation来做缓动的动画效果
1. 获取mini-player对应位置(x,y)以及scale
```
_getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,y,scale
        }
      },
```
2. 4.2 调用插件做动画
```
import animations from 'create-keyframe-animation'  //引入

const {x, y, scale} = this._getPosAndScale()                   //在method里的enter（）钩子中调用
 let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
animations.runAnimation(this.$refs.cdWrapper, 'move', done)
```
#### 4.3 切换播放模式
实现思维：播放模式三种：sequence（顺序播放）、loop（循环播放）、random（随机播放），默认是sequence，主要难点在与random播放，需要打乱播放列表。
打乱洗牌算法：遍历数组，且每次在0-数组长度 内获取一个随机数。将随机数的值与遍历值互换，
```
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
```
当打乱了播放数组后。为了要保持当前播放的歌曲不变。那么currentIndex也要相应改变
```
_resetCurrentIndex(list) {               //这里传入打乱的list
        let index = list.findIndex((item) => {
          return item.id == this.currentSong.id
        })
        this.setCurrentIndex(index)
},
```
#### 4.4 歌词
1. 获取歌词
获取歌词的接口也需要绕过refer，用axios服务器去拿qq的服务器，其设置接口如下：
```
axios.get(url, {
  headers: {
    referer: 'https://c.y.qq.com/',
    host: 'c.y.qq.com'
  },
  params: req.query
}).then((response) => { //ps：这里返回的response依然为jsonp格式，故需要对数据处理成json数据
  let ret = response.data   
  if (typeof ret === 'string') {
    const reg = /^\w+\(({.+})\)$/
    const matches = ret.match(reg)
    if (matches) {
      ret = JSON.parse(matches[1])
    }
  }
  res.json(ret)
})
```
获取到的歌词是base64格式，引入js-base64库对其进行解码
2. 歌词滚动
当前歌曲的歌词高亮是利用 js-lyric 会派发的 handle 事件
```
this.currentLyric = new Lyric(lyric, this.handleLyric)
```
js-lyric 会在每次改变当前歌词时触发这个函数，函数t提供的参数为：当前歌词的 lineNum 和 txt
为了当前高亮歌词保持最中间 是利用了 BScroll 滚动至高亮的歌词
```
handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if(lineNum > 5){
          this.$refs.lyricList.scrollToElement(this.$refs.lyricLine[lineNum - 5],0,1000)  //lyricLine代表每一句歌词 ，lyricList 为包裹歌词的content
        }else{
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
 },
```







## 六 、疑难总结 & 小技巧
### 6.1.关于 Vue
v-html可以转义字符。处理某些带有html的数据
watch 对象可以得到某个属性每次变化的新值
created（）里面定义的数据只是初始化。而不会像data（）那样给数据添加getter（）和setter()方法从而监测数据变化。
mounted 是先触发子组件的 mounted，再会触发父组件的 mounted，但是对于 created 钩子，又会先触发父组件，再触发子组件。
如果组件有计数器，在组件销毁时期要记得清理，
对于 Vue 组件，this.$refs.xxx 拿到的是 Vue 实例，所以需要再通过 $el 拿到真实的 dom
### 6.2关于 JS
1. setTimeout(fn, 20)
一般来说 JS 线程执行完毕后一个 Tick 的时间约17ms内 DOM 就可以渲染完毕所以课程中 setTimeout(fn, 20) 是非常稳妥的写法
2. audio 提供的API
```
<audio ref="audio" src=“” @play="ready" @error="error"@timeupdate="updateTime" @ended="end"></audio>
```
@play ：当src资源拿到了之后执行的事件
使用场景：songReady作为一首歌可以播放的标志位，可以解决”如果未拿到歌曲资源，就进行播放造成的DOM报错“
```
@play=‘ready’
ready() {
    this.songReady = true           
}
```
@timeupdate：拿到当前歌曲的播放时间
使用场景：获取当前时间来做对应的滚动条进度显示
```
@timeupdate="updateTime"
updateTime(e) {
        this.currentTime = e.target.currentTime
},
```
currentTime：属性，拿到或者设置当前播放到的时间点
使用场景：currentTime为进度条拖拽到一个点，对应这个点的时间刻。将currentTime设置给audio，即可把歌曲对应播放到这个时间刻
```
this.$refs.audio.currentTime = currentTime  //设置
```
@ended：歌曲播放结束后发生的事件
使用场景：播放完了、进行播放到下一首，或是如果在循环单曲模式下，继续循环这一首
```
end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
```


### 6.3 关于 webpack
1. " ~ " 使 SCSS 可以使用 webpack 的相对路径
@import "~common/scss/mixin";
@import "~common/scss/variable";
babel-runtime 会在编译阶段把 es6 语法编译的代码打包到业务代码中，所以要放在dependencies里。
Fast Click 是一个简单、易用的库，专为消除移动端浏览器从物理触摸到触发点击事件之间的300ms延时
2. 为什么会存在延迟呢？
从触摸按钮到触发点击事件，移动端浏览器会等待接近300ms，原因是浏览器会等待以确定你是否执行双击事件
3. 何时不需要使用
FastClick 不会伴随监听任何桌面浏览器
Android 系统中，在头部 meta 中设置 width=device-width 的Chrome32+ 浏览器不存在300ms 延时，所以，也不需要
```
<meta name="viewport" content="width=device-width, initial-scale=1">
```

同样的情况也适用于 Android设备（任何版本），在viewport 中设置 user-scalable=no，但这样就禁止缩放网页了
IE11+ 浏览器中，你可以使用 touch-action: manipulation; 禁止通过双击来放大一些元素（比如：链接和按钮）。IE10可以使用 -ms-touch-action: manipulation

