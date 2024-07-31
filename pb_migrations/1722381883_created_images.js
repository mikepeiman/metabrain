/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "3wx55m4y0w4ahza",
    "created": "2024-07-30 23:24:43.827Z",
    "updated": "2024-07-30 23:24:43.827Z",
    "name": "images",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "pltbfed5",
        "name": "field",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [
            "image/jpeg",
            "image/gif",
            "image/png",
            "image/avif",
            "image/webp",
            "image/tiff",
            "image/x-icon",
            "image/svg+xml"
          ],
          "thumbs": [
            "400x0",
            "0x400"
          ],
          "maxSelect": 1,
          "maxSize": 20000000,
          "protected": false
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
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza");

  return dao.deleteCollection(collection);
})
