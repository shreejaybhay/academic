/**
 * This script finds admin users in the database.
 * 
 * Usage:
 * node scripts/find-admin-user.js
 * 
 * Make sure to set the MONGODB_URI environment variable or update it in this script.
 */

const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hydrashree26:eAZFnvimBaUIl5Tg@cluster0.vpxcsph.mongodb.net/attendance-system?retryWrites=true&w=majority';

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
  role: String,
  createdAt: Date,
});

// Create Student model
const Student = mongoose.model('Student', StudentSchema);

// Find admin users
async function findAdminUsers() {
  try {
    // Find all users
    const users = await Student.find({});
    
    console.log('All users:');
    users.forEach(user => {
      console.log(`ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role || 'student'}`);
    });
    
    // Find admin users
    const adminUsers = await Student.find({ role: 'admin' });
    
    if (adminUsers.length > 0) {
      console.log('\nAdmin users:');
      adminUsers.forEach(admin => {
        console.log(`ID: ${admin._id}, Name: ${admin.name}, Email: ${admin.email}`);
      });
    } else {
      console.log('\nNo admin users found.');
      console.log('To create an admin user, update a user\'s role to "admin":');
      console.log('db.students.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } })');
    }
  } catch (error) {
    console.error('Failed to find users', error);
  } finally {
    mongoose.disconnect();
  }
}

findAdminUsers();
