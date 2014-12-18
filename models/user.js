"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    first: DataTypes.STRING,
    last: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate:{
        isEmail: {
          args:true,
          msg:'Please enter a valid email address.'
          }
        }
      },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args:[5,100],
          msg:'Please enter a password between 5 and 100 characters.'
          }
        }
      },
    url: DataTypes.STRING,
    job: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args:[1,60],
          msg:'Keep your "Job" section between 1 and 60 characters!' 
          }
        }
      },
    about: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args:[1,140],
          msg:'Keep your "About" section between 1 and 140 characters!'
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.user.hasMany(models.post);
      }
    },
    hooks: {
      beforeCreate: function(data, trash, sendback){
        var pwdToEncrypt = data.password;

        bcrypt.hash(pwdToEncrypt, 10, function(err,hash){
          data.password = hash;
          sendback(null, data);
        })
      }
    }
  });

  return user;
};
