export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const normalizedUserRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(normalizedUserRole) && normalizedUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

