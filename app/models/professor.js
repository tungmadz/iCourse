var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var professorSchema = new Schema({
    professorID: String,
    professorName: String,
    facultyID: String,
    courseList:[String]
});

module.exports = mongoose.model('Professor',professorSchema);
