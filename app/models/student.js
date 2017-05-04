var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
    studentID: String,
    studentName: String,
    birthday:String,
    class: String,
    semester:Number,
    faculty: String,
    myCourses:[String]
});

module.exports = mongoose.model('Student',studentSchema);
