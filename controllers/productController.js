const Product = require("../models/Product");

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

exports.getAllProduct = (req, res, next) => {
  Product.find({})
    .then((products) => {
      if (!products || products.length === 0) {
        // Nếu không có sản phẩm nào thỏa mãn điều kiện, trả về thông báo hoặc mã lỗi
        const err = new Error("No active products found.");
        err.status = 404; // Mã lỗi 404 - Not Found
        throw err;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(products);
    })
    .catch((err) => next(err));
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
