export function hasClass(el,classname){
	let reg = new RegExp('(^|\\s)' + classname + '(\\s|$)')
	return reg.test(el.classname);
}
export function addClass(el,classname){
	if(hasClass(el,classname)){
		return
	}
	let newClass = el.className.split(' ');
	newClass.push(classname);
	el.className = newClass.join(' ');
}
export function getData(el, attr, val){
  const prefix = 'data-';
  if(val){
    return el.setAttribute(prefix + attr, val)
  }else{
    return el.getAttribute(prefix + attr)
  }
}

let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: `webkitTransform`,
    Moz: `mozTransform`,
    O: `OTransform`,
    ms: `msTransform`,
    standard:  `transform`
  }

  for(let key in transformNames){
    if(elementStyle[transformNames[key]] != undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle(style){
  if (vendor === false){
    return false
  }

  if (vendor === 'standard'){
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
