var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
    studentID: String,
    studentName: String,
    birthday:String,
    class: String,
    faculty: String,
    myCourses:[
        {
            courseID:String
        }
    ]
});

module.exports = mongoose.model('student',studentSchema);
