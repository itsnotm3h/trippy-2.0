import 'dotenv/config';

//Validate if the env values.  
const requireEnv = (name:string): string =>{
    const value = process.env[name];
    if(!value) throw new Error(`❌ MISSING ENVIRONMENT VARIABLE: ${name}. Check your .env file.`)
    return value;
}

// Export the values for the db.ts to prevent type error. 
export const CONFIG = {
    DB_HOST: process.env.DB_HOST || 'localhost', // Safe default for host
    DB_USER: requireEnv('DB_USER'),              // Required (No default)
    DB_PASSWORD: requireEnv('DB_PASSWORD'),      // Required (No default)
    DB_NAME: requireEnv('DB_NAME'),              // Required (No default)
    DB_PORT: Number(process.env.DB_PORT) || 3307 // Safe default for port
}