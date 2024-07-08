// src/utils/analyzeSkypeChat.js

export async function analyzeSkypeChat(rawChatData) {
    console.log('%c Starting Skype chat analysis...', 'color: #4CAF50; font-weight: bold;');
  
    const allConversations = rawChatData.conversations;
    if (!allConversations || !Array.isArray(allConversations)) {
      console.error('%c Error: Unexpected data structure', 'color: #FF5252; font-weight: bold;', rawChatData);
      return null;
    }
  
    const targetConversation = allConversations[0];
    let allMessages = targetConversation.MessageList;
  
    if (!allMessages || !Array.isArray(allMessages)) {
      console.error('%c Error: No messages found in the conversation', 'color: #FF5252; font-weight: bold;', targetConversation);
      return null;
    }
  
    const analysisStartDate = new Date('2024-01-01T00:00:00Z');
    const filteredMessages = allMessages
      .filter(message => new Date(message.originalarrivaltime) >= analysisStartDate)
      .slice(0, 12);  // Limit to first 12 messages
  
    console.log(`%c Analyzing ${filteredMessages.length} messages from ${analysisStartDate.toISOString()}`, 'color: #2196F3; font-weight: bold;');
  
    const groupedMessagesList = [];
    let currentGroup = null;
  
    filteredMessages.forEach((currentMessage, index) => {
      const currentTimestamp = new Date(currentMessage.originalarrivaltime);
      const cleanedContent = cleanMessageContent(currentMessage.content);
      
      const processedMessage = {
        messageId: currentMessage.id,
        messageType: currentMessage.messagetype,
        senderInfo: currentMessage.from,
        messageContent: cleanedContent,
        contentLength: cleanedContent.length,
        exactTimestamp: currentTimestamp
      };
  
      if (currentMessage.messagetype === "Event/Call") {
        const callDurationMatch = currentMessage.content.match(/<duration>(\d+(\.\d+)?)<\/duration>/);
        processedMessage.callDuration = callDurationMatch ? parseFloat(callDurationMatch[1]) : 0;
      }
  
      const shouldStartNewGroup = !currentGroup || 
                                  (currentTimestamp - currentGroup.groupTimestamp) >= 60000 || // More than 1 minute apart
                                  currentGroup.messageType !== processedMessage.messageType ||
                                  Math.abs(currentGroup.contentLength - processedMessage.contentLength) > 5; // Content length differs significantly
  
      if (shouldStartNewGroup) {
        if (currentGroup) {
          groupedMessagesList.push(currentGroup);
        }
        currentGroup = {
          groupTimestamp: currentTimestamp,
          timeSincePreviousGroup: currentGroup ? (currentTimestamp - currentGroup.groupTimestamp) / 1000 : null,
          messageType: processedMessage.messageType,
          contentLength: processedMessage.contentLength,
          messagesInGroup: [processedMessage],
          uniqueMessages: new Map([[processedMessage.messageContent, 1]])
        };
      } else {
        if (currentGroup.uniqueMessages.has(processedMessage.messageContent)) {
          currentGroup.uniqueMessages.set(
            processedMessage.messageContent, 
            currentGroup.uniqueMessages.get(processedMessage.messageContent) + 1
          );
        } else {
          currentGroup.messagesInGroup.push(processedMessage);
          currentGroup.uniqueMessages.set(processedMessage.messageContent, 1);
        }
      }
  
      console.log(`%c Processed message ${index + 1}:`, 'color: #FFC107; font-style: italic;', 
                  `Time: ${processedMessage.exactTimestamp.toISOString()}, Type: ${processedMessage.messageType}, Length: ${processedMessage.contentLength}, Content: ${processedMessage.messageContent.slice(0, 50)}...`);
    });
  
    if (currentGroup) {
      groupedMessagesList.push(currentGroup);
    }
  
    const analysisResults = {
      conversationId: targetConversation.id,
      conversationName: targetConversation.displayName,
      totalTextMessages: filteredMessages.filter(msg => msg.messagetype !== "Event/Call").length,
      totalCalls: filteredMessages.filter(msg => msg.messagetype === "Event/Call").length,
      analysisPeriod: {
        start: analysisStartDate.toISOString(),
        end: new Date().toISOString()
      },
      groupedMessagesList
    };
  
    console.log('%c Grouped Messages:', 'color: #9C27B0; font-weight: bold;');
    groupedMessagesList.forEach((group, index) => {
      console.log(`%c Group ${index + 1}:`, 'color: #4CAF50; font-weight: bold;');
      console.log('Timestamp:', group.groupTimestamp.toISOString());
      console.log('Time since previous group:', group.timeSincePreviousGroup);
      console.log('Message Type:', group.messageType);
      console.log('Content Length:', group.contentLength);
      console.log('Unique Messages:', group.uniqueMessages.size);
      group.messagesInGroup.forEach(msg => {
        const count = group.uniqueMessages.get(msg.messageContent);
        console.log(`${msg.exactTimestamp.toISOString()} - ${msg.messageContent.slice(0, 50)}... (${count} occurrence${count > 1 ? 's' : ''})`);
      });
    });
  
    console.log('%c Skype chat analysis completed', 'color: #4CAF50; font-weight: bold;');
    console.log('%c Analysis results:', 'color: #9C27B0; font-weight: bold;', analysisResults);
  
    return analysisResults;
  }
  
  function cleanMessageContent(rawContent) {
    if (!rawContent) return '';
    
    const htmlEntityMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&nbsp;': ' '
    };
  
    // Convert <br> tags to a placeholder
    let cleanedContent = rawContent.replace(/<br\s*\/?>/gi, '[[LINEBREAK]]');
    
    // Remove HTML tags
    cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');
  
    // Replace HTML entities
    cleanedContent = cleanedContent.replace(/&[^;]+;/g, (entity) => {
      return htmlEntityMap[entity] || entity;
    });
  
    // Remove any remaining XML-like tags
    cleanedContent = cleanedContent.replace(/<\/?[^>]+(>|$)/g, "");
  
    // Restore line breaks
    cleanedContent = cleanedContent.replace(/\[\[LINEBREAK\]\]/g, '\n');
  
    // Trim whitespace and return
    return cleanedContent.trim();
  }
  
  export function formatTimeInterval(seconds) {
    if (seconds === null || seconds === undefined) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return [hours, minutes, remainingSeconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v,i) => v !== "00" || i > 0)
      .join(":");
  }