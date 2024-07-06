// src/lib/analyzeSkypeChat.js
import sentiment from 'sentiment';

export async function analyzeSkypeChat(chatData) {
  const messages = chatData.messages;
  const calls = messages.filter(m => m.type === 'call');
  
  const messageIntervals = calculateIntervals(messages);
  const callIntervals = calculateIntervals(calls);
  const callDurations = calls.map(c => c.duration);
  
  const sentiments = messages
    .filter(m => m.content)
    .map(m => sentiment(m.content).score);

  return {
    messageIntervals: {
      average: average(messageIntervals),
      min: Math.min(...messageIntervals),
      max: Math.max(...messageIntervals),
      median: median(messageIntervals)
    },
    callIntervals: {
      average: average(callIntervals),
      min: Math.min(...callIntervals),
      max: Math.max(...callIntervals),
      median: median(callIntervals)
    },
    callDurations: {
      average: average(callDurations),
      min: Math.min(...callDurations),
      max: Math.max(...callDurations),
      median: median(callDurations)
    },
    sentiments: {
      average: average(sentiments),
      min: Math.min(...sentiments),
      max: Math.max(...sentiments),
      median: median(sentiments)
    },
    timeline: messages.map(m => ({
      date: new Date(m.timestamp),
      content: m.type === 'call' ? 'Call' : m.content,
      type: m.type
    }))
  };
}

function calculateIntervals(events) {
  return events
    .slice(1)
    .map((e, i) => e.timestamp - events[i].timestamp);
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}