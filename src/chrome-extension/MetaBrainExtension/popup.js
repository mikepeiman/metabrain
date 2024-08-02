console.log("Metabrain extension loaded!");
document.getElementById('openTauriApp').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openTauriApp' });
  });