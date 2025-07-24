const mongoose = require('mongoose');


const spacesSchema = new mongoose.Schema({
    SpaceName: {
        type: String,
        required: true,
        trim : true,
        unique: true
    },
})


const Spaces = mongoose.model('Spaces', spacesSchema);
module.exports = Spaces;