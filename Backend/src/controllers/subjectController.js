const Subject = require('../models/Subject');

const getSubjects = async (req, res) => {
  try {
    const { semester, department, schemeNo } = req.query;
    const query = {};
    
    if (semester) query.semester = semester;
    if (department) query.department = department;
    if (schemeNo) query.schemeNo = schemeNo;

    const subjects = await Subject.find(query).select('name -_id');
    const subjectNames = subjects.map(sub => sub.name);
    
    res.status(200).json(subjectNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSubjects
};