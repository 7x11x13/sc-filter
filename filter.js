const auxData = {};

const send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (data) {
  const onload = this.onload;
  if (
    "__state" in this &&
    this.__state.url.startsWith("https://api-v2.soundcloud.com/stream") &&
    onload
  ) {
    this.onload = (event) => {
      const data = JSON.parse(this.responseText);
      data.collection = data.collection.filter(
        window.activeSCFeedFilter(auxData)
      );
      Object.defineProperty(this, "responseText", {
        value: JSON.stringify(data),
      });
      onload.call(this, event);
    };
  } else if (
    "__state" in this &&
    this.__state.url.match(
      /https:\/\/api-v2\.soundcloud\.com\/users\/\d+\/followings.*/
    ) &&
    onload
  ) {
    this.onload = (event) => {
      const data = JSON.parse(this.responseText);
      auxData.followingIDs = data.collection;
      Object.defineProperty(this, "responseText", {
        value: JSON.stringify(data),
      });
      onload.call(this, event);
    };
  }

  send.call(this, data);
};
