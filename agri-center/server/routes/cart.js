const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Cart endpoint - Coming soon' });
});

router.post('/add', (req, res) => {
  res.json({ success: true, message: 'Add to cart endpoint - Coming soon' });
});

module.exports = router;