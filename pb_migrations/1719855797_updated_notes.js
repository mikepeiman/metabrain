/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  // remove
  collection.schema.removeField("dpaebcfr")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dpaebcfr",
    "name": "datetime",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
})
