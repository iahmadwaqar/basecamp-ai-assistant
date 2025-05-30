type UrlHandlerMap = { [pattern: string]: () => void };

export function observeUrlChange(routes: UrlHandlerMap) {
  let currentUrl = location.href;

  const runMatchingHandler = (url: string) => {
    console.log("runMatchingHandler", url);
    for (const pattern in routes) {
      const matcher = new RegExp(pattern); // allow RegExp-style matching
      if (matcher.test(url)) {
        routes[pattern](); // Run matching handler
        break; // Only run the first match
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

  // Initial match (if needed on page load)
  runMatchingHandler(currentUrl);

  // Return a stop function if you ever want to clean up
  return () => observer.disconnect();
}
