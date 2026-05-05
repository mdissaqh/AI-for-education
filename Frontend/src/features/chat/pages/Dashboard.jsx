import React, { useState, useEffect } from 'react';
import { useChat } from '../hook/useChat';
import '../style/chat.css';

const Dashboard = () => {
  const { generatedQuestion, isGenerating, statusMessage, error, subjects, loadSubjects, generatePyqQuestion } = useChat();
  
  const [formData, setFormData] = useState({
    schemeNo: '',
    department: '',
    semester: '',
    subjectId: ''
  });

  const safeSubjects = subjects || [];

  useEffect(() => {
    if (formData.schemeNo && formData.department && formData.semester) {
      loadSubjects(formData.schemeNo, formData.department, formData.semester);
    }
  }, [formData.schemeNo, formData.department, formData.semester]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.subjectId) {
      generatePyqQuestion(formData.subjectId);
    }
  };

  return (
    <div className="chat-dashboard-wrapper">
      <div className="chat-input-section">
        <h2 className="chat-title">AI Question Generator</h2>
        
        {error && <div className="chat-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="chat-form-group">
            <label className="chat-label">Scheme No.</label>
            <input
              type="text"
              name="schemeNo"
              className="chat-input"
              value={formData.schemeNo}
              onChange={handleInputChange}
              placeholder="e.g., 22"
              required
            />
          </div>

          <div className="chat-form-group">
            <label className="chat-label">Department</label>
            <input
              type="text"
              name="department"
              className="chat-input"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., CSE"
              required
            />
          </div>

          <div className="chat-form-group">
            <label className="chat-label">Semester</label>
            <input
              type="text"
              name="semester"
              className="chat-input"
              value={formData.semester}
              onChange={handleInputChange}
              placeholder="e.g., 4th"
              required
            />
          </div>

          <div className="chat-form-group">
            <label className="chat-label">Subject</label>
            <select
              name="subjectId"
              className="chat-select"
              value={formData.subjectId}
              onChange={handleInputChange}
              required
              disabled={safeSubjects.length === 0}
            >
              <option value="" disabled>
                {safeSubjects.length === 0 ? "Fill details to load subjects" : "Select a Subject"}
              </option>
              {safeSubjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="chat-submit-btn"
            disabled={isGenerating || !formData.subjectId}
          >
            {isGenerating ? 'Processing...' : 'Generate Practice Question'}
          </button>
        </form>
      </div>

      <div className="chat-output-section">
        <h2 className="chat-title">Generated Question</h2>
        
        {statusMessage && (
          <div style={{ color: '#3b82f6', marginBottom: '15px', fontStyle: 'italic' }}>
            🔄 {statusMessage}
          </div>
        )}

        <div className="chat-stream-box">
          {generatedQuestion || (!statusMessage && "Select a subject to generate a question based on previous year patterns.")}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;