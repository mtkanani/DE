const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({ success: true, message: 'User profile endpoint - Coming soon' });
});

module.exports = router;