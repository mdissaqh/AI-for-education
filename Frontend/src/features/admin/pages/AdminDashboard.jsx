import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../hook/useAdminAuth';
import { useMaterialUpload } from '../hook/useMaterialUpload';
import '../style/dashboard.css';
import '../style/admin.css'; 

const AdminDashboard = () => {
  const { handleAdminLogout } = useAdminAuth();
  const { uploading, success, error, availableSubjects, handleUpload, loadSubjects } = useMaterialUpload();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    category: 'Notes',
    schemeNo: '',
    department: '',
    semester: '',
  });
  
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (formData.semester && formData.department && formData.schemeNo) {
      loadSubjects(formData.semester, formData.department, formData.schemeNo);
    }
  }, [formData.semester, formData.department, formData.schemeNo]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('category', formData.category);
    data.append('schemeNo', formData.schemeNo);
    data.append('department', formData.department);
    data.append('semester', formData.semester);
    data.append('pdfFile', file);

    handleUpload(data);
    
    setFormData({ title: '', subject: '', category: 'Notes', schemeNo: '', department: '', semester: '' });
    setFile(null);
    e.target.reset();
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-card">
        <div className="admin-dashboard-header">
          <h2 className="admin-dashboard-title">Material Upload</h2>
          <button className="admin-logout-btn" onClick={handleAdminLogout}>
            Logout
          </button>
        </div>

        {success && <div className="status-message status-success">Material securely uploaded to AWS S3!</div>}
        {error && <div className="status-message status-error">{error}</div>}

        <form className="upload-form-grid" onSubmit={onSubmit}>
          <div className="admin-form-group full-width">
            <label className="admin-label">Document Title</label>
            <input
              type="text"
              name="title"
              className="admin-auth-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Module 1 Notes"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Category</label>
            <select name="category" className="admin-select" value={formData.category} onChange={handleInputChange}>
              <option value="Notes">Notes</option>
              <option value="PYQs">PYQs</option>
              <option value="Scheme">Scheme</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Scheme No.</label>
            <input
              type="text"
              name="schemeNo"
              className="admin-auth-input"
              value={formData.schemeNo}
              onChange={handleInputChange}
              placeholder="e.g., 2022"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Department</label>
            <input
              type="text"
              name="department"
              className="admin-auth-input"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., CSE"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Semester</label>
            <input
              type="text"
              name="semester"
              className="admin-auth-input"
              value={formData.semester}
              onChange={handleInputChange}
              placeholder="e.g., 4th"
              required
            />
          </div>

          <div className="admin-form-group full-width">
            <label className="admin-label">Subject</label>
            <input
              type="text"
              name="subject"
              list="subject-suggestions"
              className="admin-auth-input"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g., Database Management Systems (DBMS)"
              required
            />
            <datalist id="subject-suggestions">
              {availableSubjects.map((sub, index) => (
                <option key={index} value={sub} />
              ))}
            </datalist>
          </div>

          <div className="admin-form-group full-width">
            <label className="admin-label">PDF File</label>
            <input
              type="file"
              accept=".pdf"
              className="admin-file-input"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="full-width">
            <button type="submit" className="admin-auth-button" style={{width: '100%'}} disabled={uploading || !file}>
              {uploading ? 'Uploading to AWS...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;