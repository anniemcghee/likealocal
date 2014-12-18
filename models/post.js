"use strict";

module.exports = function(sequelize, DataTypes) {
  var post = sequelize.define("post", {
    title: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args:[1,60],
          msg:'Your title should be between 1 and 60 characters!'
        }
      }
    },
    content: {
      type: DataTypes.STRING, 
      validate: {
        len: {
          args:[10,255],
          msg:'Your post should be between 10 and 1000 characters!'
        }
      }
    },
    neighborhoodId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        models.post.belongsTo(models.user);
        models.post.belongsTo(models.category);
        models.post.belongsTo(models.neighborhood);
      }
    }
  });

  return post;
};
