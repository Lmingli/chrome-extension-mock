console.log('inject');

const injectScript = (file, node = 'html') => new Promise((resolve) => {
  let ele = document.getElementsByTagName(node)[0];
  let s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  s.onload = () => {
    resolve();
  }
  ele.appendChild(s);
})

const sleep = (time) => new Promise(resolve => {
  setTimeout(() => {
    resolve();
  }, time * 1000);
})

