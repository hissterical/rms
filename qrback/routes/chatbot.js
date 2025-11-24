const express = require('express');
const router = express.Router();

// Chatbot configuration endpoint
router.get('/api/chatbot/config', (req, res) => {
  // Return the Gemini API key from environment variable
  // For security, only expose this to authenticated requests or use a backend proxy
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Chatbot configuration not available',
      message: 'Please configure GEMINI_API_KEY in environment variables'
    });
  }
  
  res.json({ apiKey });
});

module.exports = router;
