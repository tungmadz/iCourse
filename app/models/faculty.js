var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var facultySchema = new Schema({
    facultyID: String,
    facultyName:String,
    subjectList:[
        {
            semester: Number,
            subjects:[
                {
                    subjectID: String
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Faculty',facultySchema);
