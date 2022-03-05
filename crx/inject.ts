console.log('inject');

const injectScript = (file, node = 'html'): Promise<void> => new Promise((resolve) => {
  const ele = document.getElementsByTagName(node)[0];
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  s.onload = () => {
    resolve(null);
  };
  ele.appendChild(s);
});

const sleep = (time: number): Promise<void> => new Promise((resolve) => {
  setTimeout(() => {
    resolve(null);
  }, time * 1000);
});
