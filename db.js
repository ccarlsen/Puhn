var config = require('./config/cfg'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs');

//MongoDB Connection
mongoose.connect(config.mongodb.uri, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB');
    }
});

//User Collection Schema
var projectSchema = mongoose.Schema({
  name: String,
  pwd: String,
  status: Number,
  created: {
    type: Date,
    default: Date.now
  }
});

var mongoProject = mongoose.model('Project', projectSchema);

exports.createNewProject = function(name, callback) {
    var newProject = new mongoProject({
        name: name,
        pwd: '',
        status: 1
    });
    //Save Project
    newProject.save(function (err, user) {
        if (err) return handleError(err);
        callback(true);
    });
}

exports.getProjectByName = function (name, callback) {
    mongoProject.findOne({
        name: name
    })
        .select('-pwd')
        .exec(function (err, project) {
            if (err) return handleError(err);
            callback(project);
        });
}

function handleError(error) {
    console.log(error);
}