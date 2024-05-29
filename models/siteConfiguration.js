const mongoose = require("mongoose");

var siteConfigurationSchema = new mongoose.Schema({
    setting: String,
    value: Number,
});
var SiteConfiguration = mongoose.model('SiteConfiguration', siteConfigurationSchema);

module.exports = SiteConfiguration;