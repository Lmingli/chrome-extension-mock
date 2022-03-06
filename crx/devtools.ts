chrome.devtools.panels.create('mock', '', 'index.html#/panel', (panel) => {});

chrome.devtools.network.onRequestFinished.addListener((data) => {
  if (!!data) {
    if (data?._resourceType === 'xhr' && data?.request?.httpVersion !== 'data' && data?.response?.status !== 307) {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        if (tabs[0] != undefined) {
          chrome?.runtime?.sendMessage({
            locationUrl: (tabs[0].url ?? '').split('?')[0],
          });
        }
      });
      
      data.getContent((body) => {
        chrome?.runtime?.sendMessage({
          network: {
            request: data.request,
            response: body,
          },
        });
      });
    }
  }
});
