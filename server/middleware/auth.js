const jwt = require('jsonwebtoken');

// Runs before protected routes. Expects the header:  Authorization: Bearer <token>
// If the token is valid, it stores the user's id on req.userId and continues.
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in to continue' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // checks signature + expiry
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please log in again' });
  }
};
