/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pltbfed5",
    "name": "file",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza")

  // update
  collection.schema.addField(new SchemaField({
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
  }))

  return dao.saveCollection(collection)
})
