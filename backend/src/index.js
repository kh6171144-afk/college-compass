const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: db.dbType, timestamp: new Date() });
});

// Start server
const startServer = async () => {
  try {
    // If SQLite fallback, initialize tables
    if (db.isSqlite) {
      await db.initDbSchema();
    }
    
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`College Compass Backend Server Running!`);
      console.log(`Port: ${PORT}`);
      console.log(`Database Mode: ${db.dbType}`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
