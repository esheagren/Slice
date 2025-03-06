const express = require('express');
const router = express.Router();

// Handle form submission
router.post('/submit', (req, res) => {
  try {
    const { field1, field2 } = req.body;
    
    // Validate input
    if (!field1 || !field2) {
      return res.status(400).json({ error: 'Both fields are required' });
    }
    
    // Process the data (you can add your logic here)
    console.log('Received form data:', { field1, field2 });
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully',
      data: { field1, field2 }
    });
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 