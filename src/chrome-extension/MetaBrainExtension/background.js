console.log(`Metabrain service worker loaded`)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`🚀 ~ chrome.runtime.onMessage.addListener ~ request:`, request)
    if (request.action === 'send_message') {
      // Send message to SvelteKit app
      fetch('http://localhost:5432/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: request.message })
      })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
    }
  });