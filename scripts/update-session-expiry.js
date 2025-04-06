/**
 * This script updates a session's expiration date.
 * 
 * Usage:
 * node scripts/update-session-expiry.js <sessionId>
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

// Define Session schema
const SessionSchema = new mongoose.Schema({
  subject: String,
  date: Date,
  qrCodeData: String,
  expiresAt: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
});

// Create Session model
const Session = mongoose.model('Session', SessionSchema);

// Update session expiration date
async function updateSessionExpiry() {
  try {
    const sessionId = process.argv[2]; // Pass session ID as command line argument
    
    if (!sessionId) {
      console.error('Please provide a session ID as a command line argument');
      process.exit(1);
    }
    
    // Find the session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      console.error('Session not found');
      process.exit(1);
    }
    
    console.log('Current session details:');
    console.log(`Subject: ${session.subject}`);
    console.log(`Date: ${new Date(session.date).toLocaleString()}`);
    console.log(`QR Code Data: ${session.qrCodeData}`);
    console.log(`Expires At: ${new Date(session.expiresAt).toLocaleString()}`);
    
    // Update expiration date to 24 hours from now
    const newExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await Session.updateOne(
      { _id: sessionId },
      { $set: { expiresAt: newExpiryDate } }
    );
    
    console.log('\nSession expiration date updated:');
    console.log(`New Expiry Date: ${newExpiryDate.toLocaleString()}`);
  } catch (error) {
    console.error('Failed to update session expiry', error);
  } finally {
    mongoose.disconnect();
  }
}

updateSessionExpiry();
