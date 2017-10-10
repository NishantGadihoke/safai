var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({

  username: String,
  aadhar: String,
  email: String,
  password: String,
  points: Number,
  trashes: [{
    location: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
