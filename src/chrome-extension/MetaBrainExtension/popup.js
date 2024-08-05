console.log("Metabrain extension loaded, popup.js!");

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('openTauriApp').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openTauriApp' });
    });
    console.log(`🚀 ~ DOMContentLoaded:`)
    const sendMessageButton = document.getElementById('send-message');
    sendMessageButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'send_message', message: 'Hello from Chrome extension!' });
    });
});