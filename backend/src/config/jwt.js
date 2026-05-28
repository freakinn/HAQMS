const DEFAULT_INSECURE_SECRET = 'my-super-secret-secret-key-12345!!!';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_ISSUER = process.env.JWT_ISSUER || 'haqms-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'haqms-web';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === DEFAULT_INSECURE_SECRET) {
    throw new Error('JWT_SECRET must be configured with a non-default secret');
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return secret;
};

module.exports = {
  getJwtSecret,
  JWT_EXPIRES_IN,
  JWT_ISSUER,
  JWT_AUDIENCE,
};
