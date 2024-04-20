window.activeSCFeedFilter = (data) => (item) => {
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
};
