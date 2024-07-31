/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "myp705of1kqzk0b",
    "created": "2024-07-01 13:37:31.918Z",
    "updated": "2024-07-01 13:37:31.918Z",
    "name": "versions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "jaecmno8",
        "name": "object_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "asbvn98p3e9mr92",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "xka9busx",
        "name": "data",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("myp705of1kqzk0b");

  return dao.deleteCollection(collection);
})
