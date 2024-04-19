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
  constructor(name, filterFunc) {
    this.name = name;
    this.shouldShow = filterFunc;
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
  new FeedFilter("Default", (data) => (item) => true),
  new FeedFilter(
    "No reposts",
    (data) => (item) => !item.type.includes("repost")
  ),
  new FeedFilter("Not following", (data) => (item) => {
    const content = "track" in item ? item.track : item.playlist;
    return !data.followingIDs.includes(content.user_id);
  }),
  new FeedFilter("Only singles", (data) => (item) => {
    if ("track" in item) {
      return item.track.full_duration / 1000 / 60 < 30;
    } else {
      return false;
    }
  }),
  new FeedFilter("Deep cuts", (data) => (item) => {
    const content = "track" in item ? item.track : item.playlist;
    const userIsNotPopular = content.user.followers_count < 150;
    const daysOld =
      (Date.now() - Date.parse(content.created_at)) / (1000 * 3600 * 24);
    const fewPlays =
      content.playback_count &&
      daysOld > 5 &&
      content.playback_count <
        5000 / (1 + Math.exp(-(daysOld + 50) / 1500)) - 2500; // totally arbitrary magic sigmoid function
    return userIsNotPopular || fewPlays;
  }),
];

function initFilters() {
  if (!document.getElementById("sc-filter-script-1")) {
    let script = document.createElement("script");
    script.id = "sc-filter-script-1";
    script.src = browser.runtime.getURL("/filter.js");
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
          script.text = `window.activeSCFeedFilter = ${FILTERS[
            activeFilterIndex
          ].shouldShow.toString()}`;
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
