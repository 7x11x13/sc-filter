window.activeSCFeedFilter = (data) => (item) => {
  const content = "track" in item ? item.track : item.playlist;
  return !data.followingIDs.includes(content.user_id);
};
