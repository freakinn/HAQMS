const jwt = require('jsonwebtoken');
const {
  getJwtSecret,
  JWT_ISSUER,
  JWT_AUDIENCE,
} = require('../config/jwt');

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    
    // Add user details to request object
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (error) {
    console.warn('[AUTH] Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Role authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. User context missing.' });
    }

    // Role-based verification
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires role: ${roles.join(' or ')}` });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
