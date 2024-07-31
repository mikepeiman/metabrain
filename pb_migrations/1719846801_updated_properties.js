/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0d1qlf58erdpear")

  collection.deleteRule = "@request.auth.id != \"\" && @request.auth.id = object_id.created"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0d1qlf58erdpear")

  collection.deleteRule = null

  return dao.saveCollection(collection)
})
