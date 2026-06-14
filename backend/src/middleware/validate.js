/**
 * Zod validation middleware (RESEARCH Pattern 4 / CONSTRAINT-API-002).
 * Every API endpoint that accepts user input must use this middleware.
 *
 * Usage:
 *   router.post('/auth/otp/request',
 *     validate(otpRequestSchema),       // validates req.body (default)
 *     controller
 *   );
 *   router.get('/items',
 *     validate(querySchema, 'query'),   // validates req.query
 *     controller
 *   );
 *
 * On success: replaces req[source] with schema.parse output (strips unknown fields,
 * coerces types — because .strictObject() is used, unknown fields cause a 400).
 * On failure: returns 400 with { errors: [{ field, message }] } array.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const fieldErrors = result.error.issues.map(issue => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return res.status(400).json({ errors: fieldErrors });
    }

    // Replace with parsed data (strips unknown fields from .strictObject())
    req[source] = result.data;
    next();
  };
}
