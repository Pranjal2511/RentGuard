import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.rentguard_token) {
      token = req.cookies.rentguard_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);

    // Verify user exists and is active
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or inactive. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
        isExpired: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
}

