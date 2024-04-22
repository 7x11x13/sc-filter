if (!window.browser) {
  browser = chrome;
}

// https://stackoverflow.com/a/61511955
function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

class FeedFilter {
  constructor(name, filterFileName) {
    this.name = name;
    this.filterFile = `/src/filters/${filterFileName}.js`;
  }
}

class FilterMenu {
  constructor(filters, activeFilterIndex) {
    this.activeFilterIndex = activeFilterIndex;
    this.filters = filters;
    this.root = document.createElement("ul");
    this.root.className = "collectionNav g-tabs g-tabs-large";
    for (const [i, filter] of filters.entries()) {
      const li = document.createElement("li");
      li.className = "g-tabs-item";
      const button = document.createElement("a");
      button.className =
        activeFilterIndex === i ? "g-tabs-link active" : "g-tabs-link";
      button.textContent = filter.name;

      button.addEventListener("click", (e) => {
        browser.storage.sync.set({ activeSCFeedFilterIndex: i }).then(() => {
          window.location.reload();
        });
      });

      li.appendChild(button);
      this.root.appendChild(li);
    }
  }
}

const FILTERS = [
  new FeedFilter("Default", "default"),
  new FeedFilter("No reposts", "noReposts"),
  new FeedFilter("Not following", "notFollowing"),
  new FeedFilter("Only singles", "onlySingles"),
  new FeedFilter("Deep cuts", "deepCuts"),
];

function initFilters() {
  if (!document.getElementById("sc-filter-script-1")) {
    let script = document.createElement("script");
    script.id = "sc-filter-script-1";
    script.src = browser.runtime.getURL("/src/filter.js");
    document.documentElement.appendChild(script);
  }
  if (window.location.href.includes("soundcloud.com/feed")) {
    waitForElement(".stream__header").then((header) => {
      browser.storage.sync.get("activeSCFeedFilterIndex").then((item) => {
        const activeFilterIndex = item.activeSCFeedFilterIndex || 0;
        const filterMenu = new FilterMenu(FILTERS, activeFilterIndex);
        header.replaceChildren(filterMenu.root);

        if (!document.getElementById("sc-filter-script-2")) {
          let script = document.createElement("script");
          script.id = "sc-filter-script-2";
          script.src = browser.runtime.getURL(
            FILTERS[activeFilterIndex].filterFile
          );
          document.documentElement.appendChild(script);
        }
      });
    });
  }
}

waitForElement("#content").then((content) => {
  const observer = new MutationObserver(initFilters);
  observer.observe(content, { childList: true });
});

initFilters();
