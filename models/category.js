"use strict";

module.exports = function(sequelize, DataTypes) {
  var category = sequelize.define("category", {
    tag: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.category.hasMany(models.post);
      }
    }
  });

  return category;
};
