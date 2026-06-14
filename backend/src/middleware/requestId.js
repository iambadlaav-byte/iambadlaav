/**
 * Request ID middleware — attaches a unique UUID to every request.
 * Used for distributed tracing across log lines.
 * The ID is echoed in the X-Request-Id response header so clients
 * can include it when reporting issues.
 */
import crypto from 'node:crypto';

export function requestId(req, _res, next) {
  req.id = crypto.randomUUID();
  _res.setHeader('X-Request-Id', req.id);
  next();
}
