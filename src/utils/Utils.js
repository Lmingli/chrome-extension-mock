// 加载js
export const loadScript = (url) => new Promise((resolve, reject) => {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = () => {
    resolve();
  };
  script.onerror = () => {
    reject(`加载${url}失败`);
  }
  script.src = url;
  document.head.appendChild(script);
})


export const getUrlParam = (name) => {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  const r = window.location.search.substr(1).match(reg);
  if (r != null)return decodeURIComponent(r[2]);
  return null;
}

export const getCustomUrlParam = (name) => {
  if (inJrApp()) {
    try {
      const params = JSON.parse(decodeURIComponent(getUrlParam('jrparam')));
      return params[name];
    } catch (error) {
      return null;
    }
  } else {
    return getUrlParam(name);
  }
}

export const getUAParam = (name) => {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  const r = navigator.userAgent.substr(1).match(reg);
  if (r != null)return decodeURIComponent(r[2]);
  return null;
}

export const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}


export const notification = (msg) => {
  const autoClose = (instance) => {
    instance.addEventListener('click', () => {
      instance.close();
    }, false)
  }

  if (Notification.permission === "granted") {
    const instance = new Notification(msg);
    autoClose(instance);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission((permission) => {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
      if (permission === "granted") {
        new Notification(msg);
      }
    });
  }
}

/* 
  格式化日期
*/
export const dateFormatter = (date, fmt='yyyy-MM-dd hh:mm:ss') => {
  if (typeof date == 'string') {
    date = new Date(parseInt(date));
  }
  if (typeof date == 'number') {
    date = new Date(date);
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length));
    }
  }
  return fmt;
}
