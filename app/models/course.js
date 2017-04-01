var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
    id: String,
    name: String,
    credit: Number,
    professorName: String,
});

module.exports = mongoose.model('Course',courseSchema);
