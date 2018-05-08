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
