const mongoose = require('mongoose');
const clusterConfig = require(__path_configs + 'cluster');  

var schema = new mongoose.Schema({ 
    name: String, 
    avatar: String,
    status: String,
    position: String,
    category: {
        id: String,
        name: String
    },
    alias: String,
    email: String,
    dob: Date,
    renewal_date: Date,
    request_adjourn: Boolean,
    username: String,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

module.exports = mongoose.model(clusterConfig.collection_users, schema);