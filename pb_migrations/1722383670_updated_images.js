/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "risnrkpf",
    "name": "caption",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3wx55m4y0w4ahza")

  // remove
  collection.schema.removeField("risnrkpf")

  return dao.saveCollection(collection)
})
