chrome.devtools.panels.create('mock', '', 'index.html#/panel', (panel) => {});

chrome.devtools.network.onRequestFinished.addListener((data) => {
  if (!!data) {
    if (data?._resourceType === 'xhr' && data?.request?.httpVersion !== 'data' && data?.response?.status !== 307) {
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
