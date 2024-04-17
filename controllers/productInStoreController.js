const ProductInStore = require("../models/ProductInStore");
const Store = require("../models/Store");
const Product = require("../models/Product");

exports.addProductInStore = (req, res, next) => {
  ProductInStore.create(req.body)
    .then(
      (productInStore) => {
        console.log("Product In Store Created ", productInStore);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(productInStore);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.checkQuantityProductInStore = async (req, res) => {
  try {
    const { province, district } = req.query;

    // Tìm cửa hàng dựa trên tỉnh và huyện
    const stores = await Store.find({ province, district });

    if (stores.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy cửa hàng ở địa chỉ này." });
    }

    // Lặp qua các cửa hàng để kiểm tra số lượng sản phẩm
    const result = [];
    for (const store of stores) {
      const productsInStore = await ProductInStore.find({ store_id: store._id });

      if (productsInStore.length === 0) {
        result.push({
          storeName: store.storeName,
          store_id: store._id,
          message: "Cửa hàng này không có hàng.",
        });
      } else {
        const productsWithQuantity = [];
        for (const productInStore of productsInStore) {
          // Truy vấn tên sản phẩm từ bảng Product
          const product = await Product.findById(productInStore.product_id);
          productsWithQuantity.push({
            productName: product.productName,
            product_id: productInStore.product_id,
            quantity: productInStore.quantity,
          });
        }

        // Kiểm tra số lượng sản phẩm và thông báo khi sản phẩm hết hàng
        productsWithQuantity.forEach((product) => {
          if (product.quantity === 0) {
            product.message = "Hết hàng.";
          }
        });

        result.push({
          storeName: store.storeName,
          store_id: store._id,
          products: productsWithQuantity,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm cửa hàng:", error);
    res.status(500).json({ error: "Lỗi server." });
  }
};


