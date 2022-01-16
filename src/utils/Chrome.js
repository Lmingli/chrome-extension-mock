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