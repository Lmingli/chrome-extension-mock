chrome.storage.local.get('setting', (res) => {
  if (res?.setting?.openMock) {
    console.log('%c chrome-extension-MOCK loaded', 'font-size: 50px;color: #f00;font-weight: bold;');
  }
});

// chrome.webRequest.onBeforeRequest.addListener(details => {
//
// }, {urls: ["<all_urls>"]}, ["blocking"]);
