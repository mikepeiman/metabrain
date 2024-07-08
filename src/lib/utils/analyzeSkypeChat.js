// src/utils/analyzeSkypeChat.js

export async function analyzeSkypeChat(chatData) {
    const conversations = chatData.conversations;
    if (!conversations || !Array.isArray(conversations)) {
      console.error('Unexpected data structure:', chatData);
      return null;
    }
  
    const conversation = conversations[0];
    let messages = conversation.MessageList;
  
    if (!messages || !Array.isArray(messages)) {
      console.error('No messages found in the conversation:', conversation);
      return null;
    }
  
    const startDate = new Date('2024-01-01T00:00:00Z');
    messages = messages.filter(m => new Date(m.originalarrivaltime) >= startDate);
  
    let lastCallTime = null;
    let lastMessageTime = null;
  
    const detailedMessages = messages.map((m, index) => {
      const currentTime = new Date(m.originalarrivaltime);
      let intervalSinceLast = null;
      let duration = null;
      let length = null;
  
      if (m.messagetype === "Event/Call") {
        if (lastCallTime) {
          intervalSinceLast = (currentTime - lastCallTime) / 1000; // in seconds
        }
        lastCallTime = currentTime;
        const durationMatch = m.content.match(/<duration>(\d+(\.\d+)?)<\/duration>/);
        duration = durationMatch ? parseFloat(durationMatch[1]) : 0;
      } else {
        if (lastMessageTime) {
          intervalSinceLast = (currentTime - lastMessageTime) / 1000; // in seconds
        }
        lastMessageTime = currentTime;
        length = m.content ? m.content.length : 0;
      }
  
      return {
        id: m.id,
        type: m.messagetype,
        timestamp: currentTime,
        from: m.from,
        intervalSinceLast,
        duration,
        length,
        content: cleanContent(m.content)
      };
    });
  
    return {
      conversationId: conversation.id,
      displayName: conversation.displayName,
      totalMessages: detailedMessages.filter(m => m.type !== "Event/Call").length,
      totalCalls: detailedMessages.filter(m => m.type === "Event/Call").length,
      analyzedPeriod: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      detailedMessages
    };
  }

  function cleanContent(content) {
    if (!content) return '';
    
    const entityMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&nbsp;': ' '
    };
  
    // Convert <br> tags to a placeholder
    content = content.replace(/<br\s*\/?>/gi, '[[LINEBREAK]]');
    
    // Remove HTML tags
    content = content.replace(/<[^>]*>/g, '');
  
    // Replace HTML entities
    content = content.replace(/&[^;]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  
    // Remove any remaining XML-like tags
    content = content.replace(/<\/?[^>]+(>|$)/g, "");
  
    // Restore line breaks
    content = content.replace(/\[\[LINEBREAK\]\]/g, '\n');
  
    // Trim whitespace and return
    return content.trim();
  }
  
  export function formatTime(seconds) {
    if (seconds === null || seconds === undefined) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hours, minutes, secs]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v,i) => v !== "00" || i > 0)
      .join(":");
  }