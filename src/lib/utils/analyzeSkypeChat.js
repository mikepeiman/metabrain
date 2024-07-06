// src/lib/analyzeSkypeChat.js
import sentiment from 'sentiment';

export async function analyzeSkypeChat(chatData) {
    const conversations = chatData.conversations;
    if (!conversations || !Array.isArray(conversations)) {
      console.error('Unexpected data structure:', chatData);
      return null;
    }
  
    // For this analysis, we'll use the first conversation in the array
    const conversation = conversations[0];
    let messages = conversation.MessageList;
  
    if (!messages || !Array.isArray(messages)) {
      console.error('No messages found in the conversation:', conversation);
      return null;
    }
  
    // Filter messages from 2024 onwards
    const startDate = new Date('2024-01-01T00:00:00Z');
    messages = messages.filter(m => new Date(m.originalarrivaltime) >= startDate);
  
    const calls = messages.filter(m => m.messagetype === "Event/Call");
    const textMessages = messages.filter(m => m.messagetype === "RichText" || m.messagetype === "RichText/UriObject");
    
    const messageIntervals = calculateIntervals(textMessages);
    const callIntervals = calculateIntervals(calls);
    const callDurations = calls.map(c => {
      const durationMatch = c.content.match(/<duration>(\d+(\.\d+)?)<\/duration>/);
      return durationMatch ? parseFloat(durationMatch[1]) : 0;
    });
  
    return {
      conversationId: conversation.id,
      displayName: conversation.displayName,
      messageIntervals: calculateStats(messageIntervals),
      callIntervals: calculateStats(callIntervals),
      callDurations: calculateStats(callDurations),
      totalMessages: textMessages.length,
      totalCalls: calls.length,
      analyzedPeriod: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      timeline: messages.map(m => ({
        date: new Date(m.originalarrivaltime),
        content: m.messagetype === "Event/Call" ? "Call" : m.content,
        type: m.messagetype,
        from: m.from
      }))
    };
  }

function calculateIntervals(events) {
  return events
    .slice(1)
    .map((e, i) => {
      const current = new Date(e.originalarrivaltime).getTime();
      const previous = new Date(events[i].originalarrivaltime).getTime();
      return (current - previous) / 1000; // Convert to seconds
    });
}

function calculateStats(arr) {
  if (arr.length === 0) return { average: 0, min: 0, max: 0, median: 0 };
  return {
    average: average(arr),
    min: Math.min(...arr),
    max: Math.max(...arr),
    median: median(arr)
  };
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}