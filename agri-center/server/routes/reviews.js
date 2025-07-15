const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reviews endpoint - Coming soon' });
});

module.exports = router;