const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

var Category = mongoose.model("Category", categorySchema);

module.exports = Category;
