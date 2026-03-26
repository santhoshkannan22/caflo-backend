const requiredVars = ['MONGO_URI', 'FOURSQUARE_API_KEY', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = validateEnv;
