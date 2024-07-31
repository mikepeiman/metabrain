/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("asbvn98p3e9mr92")

  // remove
  collection.schema.removeField("guh4rwbc")

  // remove
  collection.schema.removeField("ywsyqw3n")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sk9vzpez",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("asbvn98p3e9mr92")

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // remove
  collection.schema.removeField("sk9vzpez")

  return dao.saveCollection(collection)
})
