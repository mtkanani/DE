const express = require('express');
const router = express.Router();

router.get('/current', (req, res) => {
  res.json({ success: true, message: 'Weather endpoint - Coming soon' });
});

module.exports = router;