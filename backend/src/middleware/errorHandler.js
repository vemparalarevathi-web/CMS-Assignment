/* eslint-disable no-unused-vars */
function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  // Mongoose duplicate key (e.g. slug/email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(', ')
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

module.exports = { notFound, errorHandler };
