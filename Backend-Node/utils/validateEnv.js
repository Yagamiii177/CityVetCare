/**
 * Environment Variable Validation
 * Ensures all required environment variables are set
 */

import Logger from './logger.js';

const logger = new Logger('ENV-VALIDATOR');

const requiredEnvVars = {
  development: [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_NAME',
    'PORT'
  ],
  production: [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'PORT',
    'CORS_ORIGIN'
  ]
};

export const validateEnv = () => {
  const env = process.env.NODE_ENV || 'development';
  const required = env === 'production' 
    ? requiredEnvVars.production 
    : requiredEnvVars.development;

  const missing = required.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    logger.error('Please check your .env file');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about insecure JWT secrets in production
  if (env === 'production') {
    const defaultSecrets = [
      'your_jwt_secret_key_change_this_in_production',
      'your_jwt_refresh_secret_key_change_this_in_production'
    ];

    if (defaultSecrets.includes(process.env.JWT_SECRET) || 
        defaultSecrets.includes(process.env.JWT_REFRESH_SECRET)) {
      logger.error('Using default JWT secrets in production!');
      throw new Error('Please set secure JWT secrets for production');
    }
  }

  logger.success('Environment variables validated successfully');
  return true;
};

export default validateEnv;
