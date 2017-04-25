var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
    courseID: String,
    courseName: String,
    professorName: String,
    time: String,
    room: String,
    available: Number,
    occupied: Number,
    credit: Number,
    fee:Number,
});

module.exports = mongoose.model('Course',courseSchema);
