/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  collection.listRule = "@request.auth.id = \"\""
  collection.viewRule = "@request.auth.id = \"\""
  collection.createRule = "@request.auth.id = \"\""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = ""

  return dao.saveCollection(collection)
})
