const Product = require("../models/Product");
const Feedback = require("../models/Feedback");

exports.addProduct = async (req, res) => {
  try {
    // Kiểm tra xem có file ảnh và video được tải lên hay không
    if (!req.files || !req.files["image"]) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Sử dụng thông tin từ đối tượng result trực tiếp
    const imageUrls = req.files["image"].map((image) => image.path);
    console.log(imageUrls);

    // Tạo một đối tượng Product mới
    const newProduct = new Product({
      productName: req.body.productName,
      category_id: req.body.category_id,
      image: imageUrls,
      description: req.body.description,
      price: req.body.price,
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const savedProduct = await newProduct.save();

    // In ra thông tin sản phẩm sau khi đăng ký thành công
    console.log("Product created:", savedProduct);

    res
      .status(200)
      .json({ success: true, status: "Product created successfully!" });
  } catch (error) {
    console.error("Error uploading image :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllProduct = async (req, res, next) => {
  try {
    // Lấy tất cả sản phẩm
    const products = await Product.find({});

    if (!products || products.length === 0) {
      // Nếu không có sản phẩm nào thỏa mãn điều kiện, trả về thông báo lỗi
      return res
        .status(404)
        .json({ success: false, message: "No active products found." });
    }

    // Tạo một mảng chứa ID của tất cả các sản phẩm
    const productIds = products.map((product) => product._id);

    // Tính toán rating trung bình cho mỗi sản phẩm
    const averageRatings = await Feedback.aggregate([
      { $match: { product_id: { $in: productIds } } }, // Lọc các đánh giá của các sản phẩm trong productIds
      { $group: { _id: "$product_id", avgRating: { $avg: "$rating" } } }, // Tính trung bình rating cho mỗi sản phẩm
    ]);

    // Tạo một đối tượng Map để lưu trữ số rating trung bình theo ID của sản phẩm
    const averageRatingMap = new Map();
    averageRatings.forEach((rating) => {
      averageRatingMap.set(rating._id.toString(), rating.avgRating); // Chuyển đổi _id thành chuỗi trước khi lưu vào Map
    });

    // Thêm số rating trung bình vào mỗi sản phẩm và gán 0 nếu sản phẩm không có rating
    const productsWithRating = products.map((product) => {
      const avgRating = averageRatingMap.get(product._id.toString()) || 0; // Chuyển đổi _id thành chuỗi trước khi lấy giá trị từ Map
      return { ...product.toObject(), avgRating };
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, products: productsWithRating });
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getProductById = (req, res, next) => {
  Product.findById(req.params.productId)
    .then(
      (product) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(product);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getProductByCategoryId = (req, res, next) => {
  Product.find({ category_id: req.params.categoryId })
    .then(
      (product) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(product);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.searchProductByName = async (req, res) => {
  try {
    // Lấy productName từ query parameter
    const productName = req.query.productName;
    let query = {};

    if (productName) {
      const regex = new RegExp(productName, "i");
      query = { productName: { $regex: regex } };
    }

    const products = await Product.find(query);

    res.json({ success: true, products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
