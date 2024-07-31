/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1vgfyvue",
    "name": "images",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "3wx55m4y0w4ahza",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  // remove
  collection.schema.removeField("1vgfyvue")

  return dao.saveCollection(collection)
})
