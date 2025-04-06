/**
 * This script creates an admin user in the database.
 * 
 * Usage:
 * node scripts/create-admin.js
 * 
 * Make sure to set the MONGODB_URI environment variable or update it in this script.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system';

// Admin user details
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define Student schema
const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Student model
const Student = mongoose.model('Student', StudentSchema);

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await Student.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminUser.password, salt);
    
    // Create admin user
    const admin = await Student.create({
      name: adminUser.name,
      email: adminUser.email,
      passwordHash,
      role: adminUser.role,
    });
    
    console.log('Admin user created successfully');
    console.log('Email:', admin.email);
    console.log('Password:', adminUser.password);
  } catch (error) {
    console.error('Failed to create admin user', error);
  } finally {
    mongoose.disconnect();
  }
}

createAdminUser();
