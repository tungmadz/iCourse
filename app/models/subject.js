var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subjectSchema = new Schema({
    subjectID:String,
    subjectName:String,
    courseList:[String]
});

module.exports = mongoose.model('Subject',subjectSchema);
