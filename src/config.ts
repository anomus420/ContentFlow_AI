import dotenv from 'dotenv';
dotenv.config();

const rawEnvKey = (process.env.GROQ_API_KEY || '').replace(/^["']|["']$/g, '').trim();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  groqApiKey: rawEnvKey,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autonomous_ai_creator',
  nodeEnv: process.env.NODE_ENV || 'development',
  cadenceMinHours: parseFloat(process.env.CADENCE_MIN_HOURS || '3'),
  cadenceMaxHours: parseFloat(process.env.CADENCE_MAX_HOURS || '6'),
};
