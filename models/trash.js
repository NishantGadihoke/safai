var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrashSchema = new Schema({

  location: String,
  imageName: String,
  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Trash', TrashSchema);
