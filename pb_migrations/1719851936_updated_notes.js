/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  collection.updateRule = "@request.auth.id = user_id.id"
  collection.deleteRule = "@request.auth.id = user_id.id"

  // remove
  collection.schema.removeField("uztkxi9o")

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
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  collection.updateRule = "@request.auth.id = author_id.id"
  collection.deleteRule = "@request.auth.id = author_id.id"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uztkxi9o",
    "name": "author_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // remove
  collection.schema.removeField("dpaebcfr")

  return dao.saveCollection(collection)
})
