export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.issues) {
        const errorMessages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid input data',
      });
    }
  };
}

