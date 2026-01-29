import type { NextConfig } from "next";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URL: process.env.MONGODB_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_API_URL: process.env.GEMINI_API_URL,
  },
};

export default nextConfig;
