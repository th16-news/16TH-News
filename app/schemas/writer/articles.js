const mongoose = require('mongoose');
const clusterConfig = require(__path_configs + 'cluster');  

var schema = new mongoose.Schema({ 
    name: String, 
    thumb: String,
    category: {
        id: String,
        name: String
    },
    type: String,
    status: String,
    tags: [{
        id: String,
        name: String
    }],
    summary: String,
    content: String,
    refuse_reason: String,
    expected_publish_time: Date,
    created: {
        user_id: Number,
        user_name: String,
        time: Date
    },
    browsed: {
        user_id: Number,
        user_name: String,
        time: Date
    },
    published: {
        user_id: Number,
        user_name: String,
        time: Date
    }
});

module.exports = mongoose.model(clusterConfig.collection_articles, schema);