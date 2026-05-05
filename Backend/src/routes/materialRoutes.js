const express = require('express');
const multer = require('multer');
const { uploadMaterial } = require('../controllers/materialController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('pdfFile'), uploadMaterial);

module.exports = router;