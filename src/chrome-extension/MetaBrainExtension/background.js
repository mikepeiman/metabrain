chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTauriApp') {
      // Use native messaging to communicate with the Tauri app
      chrome.runtime.sendNativeMessage('com.your_app.tauri', { action: 'open', page: '/specific-page' },
        response => {
          console.log('Response from Tauri app:', response);
        }
      );
    }
  });