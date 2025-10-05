import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';

dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result[key] = value;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}

async function main() {
  try {
    const { email, password } = parseArgs();
    if (!email || !password) {
      console.error('Usage: ts-node -r dotenv/config src/scripts/resetAdminPassword.ts --email <email> --password <newPassword>');
      process.exit(1);
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness';
    await mongoose.connect(mongoUri);

    let admin = await Admin.findOne({ email });

    if (!admin) {
      admin = new Admin({
        email,
        password,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: ['manage_users', 'manage_therapists', 'view_analytics', 'manage_appointments'],
        isActive: true
      } as any);
      await admin.save();
      console.log('Admin created and password set for', email);
    } else {
      admin.password = password as any;
      await admin.save();
      console.log('Admin password updated for', email);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin password:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(3);
  }
}

main();
