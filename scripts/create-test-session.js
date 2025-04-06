/**
 * This script creates a test session with a future expiration date.
 * 
 * Usage:
 * node scripts/create-test-session.js
 * 
 * Make sure to set the MONGODB_URI environment variable or update it in this script.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hydrashree26:eAZFnvimBaUIl5Tg@cluster0.vpxcsph.mongodb.net/attendance-system?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define Session schema
const SessionSchema = new mongoose.Schema({
  subject: String,
  date: Date,
  qrCodeData: String,
  expiresAt: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Session model
const Session = mongoose.model('Session', SessionSchema);

// Create test session
async function createTestSession() {
  try {
    // Get admin user ID
    const adminId = process.argv[2]; // Pass admin ID as command line argument
    
    if (!adminId) {
      console.error('Please provide an admin ID as a command line argument');
      process.exit(1);
    }
    
    // Generate QR code data
    const qrCodeData = uuidv4();
    
    // Create session with future expiration date (24 hours from now)
    const session = await Session.create({
      subject: 'Test Session',
      date: new Date(),
      qrCodeData,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdBy: new mongoose.Types.ObjectId(adminId),
    });
    
    console.log('Test session created successfully');
    console.log('Session ID:', session._id);
    console.log('QR Code Data:', qrCodeData);
    console.log('Expires At:', session.expiresAt);
  } catch (error) {
    console.error('Failed to create test session', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestSession();
