const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_MAPS_API_KEY'];

const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = validateEnv;
