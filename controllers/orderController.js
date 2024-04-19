const paypal = require("paypal-rest-sdk");
const Order = require("../models/Order");

// Configure PayPal SDK with your credentials
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AVAYen3_vYVlrsBPQvwLeiFgrVXmf6BAIyOwk_OBGPqXOrksIPxQDFGhc-8QyN3uHuxKP6quEjbyU1Gn",
  client_secret:
    "EMiBTFeAPOxhb4jy-1NtHRhlQkGu-D-CajreZmFCFk7n5xi2xO0uWC6l7fiqd5aLTYFhfYrtblvLkaSF",
});

exports.createOrder = async (req, res) => {
  // Lấy thông tin đơn hàng từ request body
  const { user_id, product_id, store_id, quantity, totalPrice } = req.body;

  // Tạo một đơn hàng mới trong cơ sở dữ liệu
  console.log(req.body);
  const newOrder = new Order({
    user_id,
    product_id,
    store_id,
    quantity,
    totalPrice,
    status: "false", // Set trạng thái đơn hàng là đang chờ
  });

  try {
    // Lưu đơn hàng vào cơ sở dữ liệu
    const savedOrder = await newOrder.save();

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/order/responseSucessPayPal",
        cancel_url: "http://localhost:3000/order/responseCancelPayPal",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: `Order of ${user_id}`,
                sku: newOrder.order_id,
                price: totalPrice.toString(),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: totalPrice.toString(),
          },
          description: "Payment for order",
        },
      ],
    };
    // paypal.payment.create(create_payment_json, function (error, payment) {
    //   if (error) {
    //     throw error;
    //   } else {
    //     for (let i = 0; i < payment.links.length; i++) {
    //       if (payment.links[i].rel === "approval_url") {
    //         res.redirect(payment.links[i].href);
    //       }
    //     }
    //   }
    // });
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create PayPal payment" });
      } else {
        const approvalUrl = payment.links.find(
          (link) => link.rel === "approval_url"
        ).href;
        res.json({ url: approvalUrl });
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.responseSucessPayPal = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    paypal.payment.execute(
      paymentId,
      { payer_id: PayerID },
      async (error, payment) => {
        if (error) {
          console.error("Error executing PayPal payment:", error);
          return res.status(500).json({ error: "Error processing payment" });
        } else {
          const orderID = payment.transactions[0].item_list.items[0].sku;

          const order = await Order.findOneAndUpdate(
            { order_id: orderID, status: "false" }, // Tìm đơn hàng với order_id và status chưa được xác nhận
            { status: "true" }, // Cập nhật trạng thái đơn hàng thành completed
            { new: true } // Trả về đối tượng đã được cập nhật
          );

          if (!order) {
            return res.status(404).json({ error: "Order not found" });
          } else {
            // Nếu đơn hàng được tìm thấy và cập nhật thành công, chuyển hướng hoặc trả về thông báo thành công
            // res.redirect('/thank-you');
            return res.status(200).send("Payment successful!");
          }
        }
      }
    );
  } catch (error) {
    console.error("Error processing PayPal payment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.responseCancelPayPal = (req, res) => {
  // Xử lý hủy bỏ thanh toán
  res.send("Payment canceled!");
};

exports.addToCart = async (req, res) => {
  try {
    // Giả sử bạn nhận được dữ liệu từ client gửi lên, chẳng hạn như user_id, product_id, store_id và quantity
    const { user_id, product_id, store_id, quantity, totalPrice } = req.body;

    // Tạo một đối tượng Order mới
    const newOrder = new Order({
      user_id: user_id,
      product_id: product_id,
      store_id: store_id,
      quantity: quantity,
      totalPrice: totalPrice,
      status: false, // Trạng thái mặc định là false
    });

    // Lưu đơn hàng vào cơ sở dữ liệu
    await newOrder.save();

    res.json({ success: true, message: "Đã tạo đơn hàng thành công." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Đã xảy ra lỗi khi tạo đơn hàng." });
  }
};
