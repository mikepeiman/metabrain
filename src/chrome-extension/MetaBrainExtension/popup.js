console.log("Metabrain extension loaded!");
document.getElementById('openTauriApp').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openTauriApp' });
  });

  document.addEventListener('DOMContentLoaded', function () {
    console.log(`🚀 ~ DOMContentLoaded:`)
    const sendMessageButton = document.getElementById('send-message');
    sendMessageButton.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'send_message', message: 'Hello from Chrome extension!' });
    });
  });