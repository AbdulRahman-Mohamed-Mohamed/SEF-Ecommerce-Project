  import jwt from "jsonwebtoken";
  import User from "../models/User.model.js";

  async function login(req, res) {
    try {
      const { email, password } = req.body;
      const userSearch = await User.findOne({ email }).select("+password");
      if (!userSearch) {
        return res
          .status(401)
          .json({ message: "Email or Password is incorrect" });
      }
      const isPasswordMatch = await userSearch.comparePassword(password);
      if (!isPasswordMatch) {
        return res
          .status(401)
          .json({ message: "Email or Password is incorrect" });
      }
      if (!userSearch.isVerified) {
        return res
          .status(401)
          .json({ message: "Email or Password is incorrect" });
      }
      const expiresIn = process.env.JWT_EXPIRE || "7d";
      const token = jwt.sign({ sub: userSearch._id }, process.env.JWT_SECRET, {
        expiresIn,
      });
      res.status(200).json({
        message: "Login is successful",
        token,
        user: {
          id: userSearch._id,
          username: userSearch.username,
          email: userSearch.email,
          role: userSearch.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  export default login;
