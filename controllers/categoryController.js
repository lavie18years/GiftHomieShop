const Category = require("../models/Category");

exports.addCategory = (req, res, next) => {
    Category.create(req.body)
      .then(
        (category) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(category);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  };