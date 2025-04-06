/**
 * This script lists all sessions in the database.
 * 
 * Usage:
 * node scripts/list-sessions.js
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

// List all sessions
async function listSessions() {
  try {
    // Find all sessions
    const sessions = await Session.find({}).sort({ createdAt: -1 });
    
    if (sessions.length > 0) {
      console.log(`Found ${sessions.length} sessions:`);
      sessions.forEach(session => {
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        const isExpired = now > expiresAt;
        
        console.log(`\nID: ${session._id}`);
        console.log(`Subject: ${session.subject}`);
        console.log(`Date: ${new Date(session.date).toLocaleString()}`);
        console.log(`QR Code Data: ${session.qrCodeData}`);
        console.log(`Expires At: ${expiresAt.toLocaleString()} (${isExpired ? 'EXPIRED' : 'ACTIVE'})`);
        console.log(`Created By: ${session.createdBy}`);
        console.log(`Created At: ${new Date(session.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('No sessions found.');
    }
  } catch (error) {
    console.error('Failed to list sessions', error);
  } finally {
    mongoose.disconnect();
  }
}

listSessions();
