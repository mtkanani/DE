const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard endpoint - Coming soon' });
});

module.exports = router;