var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var AdminSchema = new mongoose.Schema(
    {
        name: {type: String},
        cities: [{type: String}],
        email: {type: String, unique: true, required: true}
    },
    {
      timestamps: true
    }
)

var AdminsModel = new mongoose.model('AdminsModel', AdminSchema)
module.exports = AdminsModel