const jwt = require('jsonwebtoken');

/**
 * Protects admin-only routes. Expects `Authorization: Bearer <token>`.
 */
function protectRoute(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication credentials found.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }
}

module.exports = protectRoute;
