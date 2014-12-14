"use strict";

module.exports = function(sequelize, DataTypes) {
  var post = sequelize.define("post", {
    title: DataTypes.STRING,
    content: DataTypes.STRING,
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
