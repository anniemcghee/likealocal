"use strict";

module.exports = function(sequelize, DataTypes) {
  var neighborhood = sequelize.define("neighborhood", {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    igtag: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.neighborhood.hasMany(models.post);
      }
    }
  });

  return neighborhood;
};
