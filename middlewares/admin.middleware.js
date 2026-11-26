function admin(req, res, next) {
  if (req.user.role !== "admin") {
    return (res.status(403).json({ message: "HTTP 403 Forbidden" }));
  }
  next()
}
export default admin;
