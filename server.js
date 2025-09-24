const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Main route to serve the frontend application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        message: 'FulxerPro server is running perfectly',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        platform: 'FulxerPro',
        version: '1.0.0',
        status: 'active',
        server: 'AWS EC2',
        port: PORT
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FulxerPro server is running!`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
});
