function getRandomInt(min, max){
  return Math.floor( Math.random() * (max-min+1) + min)
}

export function shuffle(arr) {
  for(let i=0; i<arr.length; i++){
    let j = getRandomInt(0,arr.length-1)
    let j_val = arr[i]
    arr[i] = arr[j]
    arr[j] = j_val
  }
  return arr
}
