const mongoose = require("mongoose");

var editionSchema = new mongoose.Schema({
    name: String,
    price_pool: String,
    participants: String,
});
var EditionSchema = mongoose.model('Edition', editionSchema);

module.exports = EditionSchema;