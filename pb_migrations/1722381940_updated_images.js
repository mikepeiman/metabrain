/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sqmwomuq",
    "name": "notes",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "v0k41v7gl34wuvu",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza")

  // remove
  collection.schema.removeField("sqmwomuq")

  return dao.saveCollection(collection)
})
