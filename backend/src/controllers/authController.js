import { registerUser, loginUser } from '../services/authService.js';
import { logAuditEvent } from '../services/auditService.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
  try {
    const { user, token } = await registerUser(req.body);

    res.cookie('rentguard_token', token, COOKIE_OPTIONS);

    await logAuditEvent({
      actorId: user._id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email, role: user.role },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await loginUser(req.body);

    res.cookie('rentguard_token', token, COOKIE_OPTIONS);

    await logAuditEvent({
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email, role: user.role },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie('rentguard_token', COOKIE_OPTIONS);

    if (req.user) {
      await logAuditEvent({
        actorId: req.user._id,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user._id,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
}

