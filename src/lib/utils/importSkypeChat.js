// src/lib/importSkypeChat.js
import Dexie from 'dexie';

const db = new Dexie('SkypeChatDB');
db.version(1).stores({
  chatData: '++id,data'
});

export const importSkypeChat = {
  async initDB() {
    return db;
  }
};