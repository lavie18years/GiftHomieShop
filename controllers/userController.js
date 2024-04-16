const User = require("../models/User");
const bcrypt = require("bcrypt");
const authenticate = require("../authenticate");

exports.postLoginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).populate("role_id");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username và password không chính xác.",
      });
    }

    // Kiểm tra mật khẩu đã hash
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({
          success: false,
          message: "Password không chính xác.",
        });
      }
      // Nếu mật khẩu hợp lệ, tạo mã token và trả về cho người dùng
      const token = authenticate.getToken({ _id: user._id });
      res.status(200).json({
        success: true,
        token: token,
        user: user,
        status: "Bạn đã đăng nhập thành công!",
      });
    });
  } catch (error) {
    return next(error);
  }
};

exports.postAddUser = async (req, res, next) => {
  try {
    // Check if there is an image file uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }

    // Get the Cloudinary image URL
    const imageUrl = req.file.path;

    // Check if username already exists
    const existingUsername = await User.findOne({
      username: req.body.username,
    });
    const existingEmail = await User.findOne({ email: req.body.email });
    const existingPhone = await User.findOne({ phone: req.body.phone });
    if (existingUsername && existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Username and email đã tồn tại." });
    }
    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username đã tồn tại." });
    }

    // Check if email already exists

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại." });
    }
    if (existingPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone đã tồn tại." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create the user
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      image: imageUrl,
      gender: req.body.gender,
      address: req.body.address,
      fullName: req.body.fullName,
      status: req.body.status,
      phone: req.body.phone,
      role_id: req.body.role_id,
    });

    // Return success response
    res
      .status(200)
      .json({ success: true, user: user, message: "Registration Successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
