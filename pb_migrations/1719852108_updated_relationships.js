/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jd0yj7s9zd1y2ac")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rotuhdsn",
    "name": "user_id",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jd0yj7s9zd1y2ac")

  // remove
  collection.schema.removeField("rotuhdsn")

  return dao.saveCollection(collection)
})
