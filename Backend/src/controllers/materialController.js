const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const Material = require('../models/Material');
const Subject = require('../models/Subject');
const s3Client = require('../config/s3');

const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { title, subject, category, schemeNo, department, semester } = req.body;

    let subjectDoc = await Subject.findOne({ 
      name: subject, 
      semester, 
      department, 
      schemeNo 
    });

    if (!subjectDoc) {
      subjectDoc = await Subject.create({
        name: subject,
        semester,
        department,
        schemeNo
      });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `materials/${uniqueFileName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/materials/${uniqueFileName}`;

    const material = await Material.create({
      title,
      subject: subjectDoc._id,
      category,
      schemeNo,
      department,
      semester,
      pdfUrl
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadMaterial
};