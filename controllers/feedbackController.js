const Order = require("../models/Order");
const Feedback = require("../models/Feedback");

exports.addFeedback = async (req, res) => {
  try {
    const { user_id, product_id, content } = req.body;

    // Kiểm tra xem người dùng có đơn hàng nào của sản phẩm không
    const order = await Order.findOne({ user_id, product_id, status: "true" });
    if (!order) {
      return res
        .status(400)
        .json({ error: "Bạn cần mua sản phẩm này trước khi bình luận." });
    }

    // Tạo bình luận mới
    const newFeedback = new Feedback({ user_id, product_id, content });
    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      message: "Bình luận được thêm thành công.",
      feedback: savedFeedback,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { user_id } = req.body;
    const feedbackId = req.params.feedbackId;

    // Kiểm tra xem feedback tồn tại và được tạo bởi user_id
    const feedback = await Feedback.findOne({ _id: feedbackId, user_id });
    if (!feedback) {
      return res.status(404).json({
        error: "Không tìm thấy feedback hoặc bạn không có quyền chỉnh sửa.",
      });
    }

    // Cập nhật nội dung và điểm đánh giá của feedback
    feedback.content = req.body.content;
    feedback.updateTime = Date.now();

    const updatedFeedback = await feedback.save();
    res.json({
      message: "Feedback đã được cập nhật thành công.",
      feedback: updatedFeedback,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
