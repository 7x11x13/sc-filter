window.activeSCFeedFilter = (data) => (item) => {
  if ("track" in item) {
    return item.track.full_duration / 1000 / 60 < 30;
  } else {
    return false;
  }
};
