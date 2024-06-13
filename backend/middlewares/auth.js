// Middleware to authenticate user session
const authenticate = (req, res, next) => {
    if (req.session && req.session.user) {
      next(); // User is authenticated
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
  
  // Middleware to authorize based on roles
  const authorize = (...roles) => {
    return (req, res, next) => {
      const { role } = req.session.user;
      if (roles.includes(role)) {
        next(); // User is authorized
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }
    };
  };
  
  module.exports = { authenticate, authorize };
  