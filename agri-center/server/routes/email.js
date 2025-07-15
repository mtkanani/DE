const express = require('express');
const router = express.Router();

router.post('/send', (req, res) => {
  res.json({ success: true, message: 'Email endpoint - Coming soon' });
});

module.exports = router;