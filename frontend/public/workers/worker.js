let pollingInterval;
let lastFetchTime = 0;

self.onmessage = function (e) {
  if (e.data.type === "start") {
    const ownerId = e.data.ownerId;
    const accessToken = e.data.accessToken;

    // Clear any existing interval
    if (pollingInterval) clearInterval(pollingInterval);

    // Start polling
    pollingInterval = setInterval(() => {
      fetch(`http://127.0.0.1:8000/api/get_messages/user/${ownerId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((response) => response.json())
        .then((data) => { 
          self.postMessage({
            type: "newMessages",
            data: data,
            timestamp: Date.now(),
          });
        })
        .catch((error) => {
          self.postMessage({
            type: "error",
            error: error.message,
          });
        });
    }, 5000);
  } else if (e.data.type === "stop") {
    if (pollingInterval) clearInterval(pollingInterval);
  }
};