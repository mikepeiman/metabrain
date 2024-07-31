/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  collection.deleteRule = "@request.auth.id = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v0k41v7gl34wuvu")

  collection.deleteRule = ""

  return dao.saveCollection(collection)
})
