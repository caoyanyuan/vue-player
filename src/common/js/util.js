function getRandomInt(min, max){
  return Math.floor( Math.random() * (max-min+1) + min)
}

export function shuffle(arr) {
  var _arr = arr.slice()
  for(let i=0; i<_arr.length; i++){
    let j = getRandomInt(0,i)
    let j_val = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = j_val
  }
  return _arr
}

