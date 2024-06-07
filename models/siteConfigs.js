const mongoose = require("mongoose");

var configSchema = new mongoose.Schema({
    configName: String,
    state: Boolean,
    value: String,
});
var siteConfig = mongoose.model('Config', configSchema);

module.exports = siteConfig;