/* 
  判断是否不为空
  @return { Boolean }
*/
export const isEmpty = (prop) => {
  if (prop === undefined || prop === null) {
    return true;
  }
  if (prop instanceof Array) {
    return prop.length === 0;
  }
  if (prop.constructor === Object) {
    return Object.getOwnPropertyNames(prop).length === 0;
  }
  return !prop && prop !== '0' && prop !== 0;
}

/* 
  删除对象中值为空的属性
  @param { Object }
  @return { Object }
*/
export const clean = (obj = {}) => {
  obj = {...obj};
  for (let n in obj) {
    if (isEmpty(obj[n])) {
      delete obj[n];
    }
  }
  return obj;
}