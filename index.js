var through = require('through2')
var pump = require('pump')
var ndjson = require('ndjson')

module.exports = function duplicates (jsonStream, cb) {
  /*
    jsonStream:
    {"name": "bob": "age": 24, "id": 1}
    {"name": "ange": "age": 29, "id": 2}
    {"name": "karissa": "age": 24, "id": 3}
    {"name": "john": "age": 29, "id": 4}
    {"name": "john": "age": 32, "id": 5}
    {"name": "grayson": "age": 29, "id": 6}

    to -> cb(err, duplicates)

    duplicates:
    {
      "name": 2,
      "age": 4,
      "id": 0
    }
  */

  var allFields = {}

  var valueCounter = through.obj(function (row, enc, next) {
    var fields = Object.keys(row) //name, age
    for (var i in fields) {
      var field = fields[i] // name
      var rowValue = row[field] // "bob"
      var values = allFields[field] || {} // {bob: 1, ange: 1, etc..}
      values[rowValue] = (values[rowValue] || 0) + 1
      allFields[field] = values
    }
    return next()
  })

  pump(jsonStream, valueCounter, function done (err) {
    if (err) return cb(err)

    var uniques = []
    var fields = Object.keys(allFields)

    for (var i in fields) { // [name, age, etc]
      var field = fields[i] // "age"
      var fieldValues = allFields[field] // { 26: 1, 29: 2, etc.. }
      duplicates[field] = duplicates[field] || 0
      for (var i in fieldValues) {
        var count = fieldValues[i]
        if (count > 1) {
          duplicates[field] = parseInt(duplicates[field]) + parseInt(count)
        }
      }
    }
    return cb(null, duplicates)
  })
}