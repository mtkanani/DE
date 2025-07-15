const express = require('express');
const router = express.Router();

router.post('/create', (req, res) => {
  res.json({ success: true, message: 'Payment creation endpoint - Coming soon' });
});

module.exports = router;