var mongoose = require('mongoose');
var Schema = mongoose.Schema;



module.exports = mongoose.model('User', new Schema ({

   user: {

              name: { type: String, unique:true, required: true},
              password: { type: String, required: true , min: 8, max: 24},
              salt: String,
              realname: {type: String, unique: false, require: false, min: 3, max: 25},
              nickname: {type: String, unique: false, require: false, min: 3, max: 25},
              gender: {type: String, unique: false, require: false, min: 4, max: 6},
              age: {type: String, unique: false, require: false, min: 2, max: 3},
              friendRequest: [{
                            _id: false,
                            name: {type: String, unique: true}

              }],
              friendList: [{

                          _id: false,
                          name: {type: String}


              }],

              blocked: [{

                        _id: false,
                        name: {type: String}


              }]

      }


}));
