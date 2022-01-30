const { MODE } = import.meta.env;
if (MODE === 'development') {
  window.asd = (data) => {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    for (let n in data) {
      window.sessionStorage.setItem(n, typeof data[n] === 'object' ? JSON.stringify(data[n]) : data[n]);
    }
  }
  class Emitter {
    constructor() {
      this.timer = null;
      this.list = Object.create(null);
    }
    on(type, handler) {
      this.list[type] = handler;
    }
    emit(type, payload){
      if (this.list[type]) {
        this.timer = setTimeout(() => {
          if (this.timer) {
            return;
          }
          this.list[type](payload);
        }, 0)
      }
    }
  }
  const E = new Emitter();

  window.chrome = {
    ...chrome,
    storage: {
      local: {
        get: (params, cb) => {
          const res = !!params ? ({[params]: window.sessionStorage.getItem(params) }) : window.sessionStorage;
          let obj = {};
          for (let n in res) {
            if (res.hasOwnProperty(n)) {
              obj[n] = JSON.parse(res[n]);
            }
          }
          cb(obj);
        },
        set: (params, cb) => {
          for (let n in params) {
            window.sessionStorage.setItem(n, JSON.stringify(params[n]));
          }
          cb();
          E.emit('change');
        },
        remove: (params, cb) => {
          window.sessionStorage.removeItem(params);
          cb();
          E.emit('change');
        },
        clear: (cb) => {
          window.sessionStorage.clear();
          cb();
          E.emit('change');
        },
        onChanged: {
          addListener: (cb) => {
            E.on('change', cb);
          },
        },
      }
    }
  }
}


export const storage = {
  get: (params = null) => new Promise((resolve) => {
    chrome.storage.local.get(params, (res) => {
      resolve(res ?? {});
    })
  }),
  set: (params = {}) => new Promise((resolve) => {
    chrome.storage.local.set(params, () => {
      resolve();
    });
  }),
  remove: (key) => new Promise((resolve) => {
    chrome.storage.local.remove(key, () => {
      resolve();
    });
  }),
  clear: () => new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  }),
  onchange: (cb) => {
    chrome.storage.local.onChanged.addListener(() => {
      cb();
    })
  }
}