const mongoose = require('mongoose');
const clusterConfig = require(__path_configs + 'cluster');  

var schema = new mongoose.Schema({ 
    name: String, 
    status: String
});

module.exports = mongoose.model(clusterConfig.collection_tags, schema);