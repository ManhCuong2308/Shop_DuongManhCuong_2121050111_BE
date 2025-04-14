import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // Simple session-based auth
    if (!req.session.userId) {
      res.status(401);
      throw new Error('Not authorized, no session');
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
}; 