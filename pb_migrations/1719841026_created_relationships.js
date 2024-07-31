/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "jd0yj7s9zd1y2ac",
    "created": "2024-07-01 13:37:06.411Z",
    "updated": "2024-07-01 13:37:06.411Z",
    "name": "relationships",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "adt8yqqq",
        "name": "from_object_id",
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
        "id": "7xnpxxz4",
        "name": "to_object_id",
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
        "id": "nazunkrn",
        "name": "type",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
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
  const collection = dao.findCollectionByNameOrId("jd0yj7s9zd1y2ac");

  return dao.deleteCollection(collection);
})
