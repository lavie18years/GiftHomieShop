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
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
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
    // Lấy thông tin giao dịch từ query parameters
    const { paymentId, payerID } = req.query;

    // Lấy thông tin chi tiết về giao dịch từ PayPal
    paypal.payment.execute(
      paymentId,
      { payer_id: payerID },
      async (error, payment) => {
        if (error) {
          throw error;
        } else {
          // Xác định đơn hàng tương ứng với giao dịch
          const order = await Order.findOne({
            user_id: payment.payer.payer_info.email, // Sử dụng email của người thanh toán làm điều kiện tìm kiếm
            totalPrice: payment.transactions[0].amount.total, // Sử dụng tổng giá trị của giao dịch làm điều kiện tìm kiếm
            status: "false", // Chỉ xem xét các đơn hàng chưa được xác nhận
            // Các điều kiện tìm kiếm khác nếu cần
          });

          if (!order) {
            // Nếu không tìm thấy đơn hàng tương ứng, xử lý lỗi hoặc trả về thông báo không tìm thấy
            res.status(404).json({ error: "Order not found" });
          } else {
            // Cập nhật trạng thái của đơn hàng thành hoàn thành
            order.status = "completed";
            await order.save();

            // Hiển thị thông báo cho người dùng
            res.send("Payment successful!");

            // Hoặc chuyển hướng người dùng đến trang cảm ơn
            // res.redirect('/thank-you');
          }
        }
      }
    );
  } catch (error) {
    console.error("Error processing PayPal payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.responseCancelPayPal = (req, res) => {
  // Xử lý hủy bỏ thanh toán
  res.send("Payment canceled!");
};
