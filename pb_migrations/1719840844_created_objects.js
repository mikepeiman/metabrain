/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "asbvn98p3e9mr92",
    "created": "2024-07-01 13:34:04.522Z",
    "updated": "2024-07-01 13:34:04.522Z",
    "name": "objects",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "guh4rwbc",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ywsyqw3n",
        "name": "content",
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
  const collection = dao.findCollectionByNameOrId("asbvn98p3e9mr92");

  return dao.deleteCollection(collection);
})
