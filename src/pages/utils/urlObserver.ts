type UrlHandlerMap = { [pattern: string]: () => void };

export function observeUrlChange(routes: UrlHandlerMap) {
  let currentUrl = location.href;
  const runMatchingHandler = (url: string) => {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const pathWithoutBucket = path.replace(/^\/\d+\/buckets\/\d+/, "");

    for (const pattern in routes) {
      const matcher = new RegExp(pattern);
      if (matcher.test(pathWithoutBucket)) {
        routes[pattern]();
      }
    }
  };

  const observer = new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      runMatchingHandler(currentUrl);
    }
  });

  observer.observe(document, { childList: true, subtree: true });

  runMatchingHandler(currentUrl);

  return () => observer.disconnect();
}
