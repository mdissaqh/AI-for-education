import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../hook/useChat';
import '../style/chat.css';

const Dashboard = () => {
  const { generatedQuestion, isGenerating, statusMessage, error, subjects, loadSubjects, generatePyqQuestion } = useChat();
  
  const [formData, setFormData] = useState({
    schemeNo: '',
    department: '',
    semester: '',
    subjectId: '',
    totalMarks: 45
  });

  useEffect(() => {
    if (formData.schemeNo && formData.department && formData.semester) {
      loadSubjects(formData.schemeNo, formData.department, formData.semester);
    }
  }, [formData.schemeNo, formData.department, formData.semester]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePyqQuestion(formData.subjectId, formData.totalMarks);
  };

  return (
    <div className="chat-dashboard-wrapper">
      <div className="chat-input-section">
        <h2 className="chat-title">AI Question Generator</h2>
        {error && <div className="chat-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="chat-form-group">
            <label className="chat-label">Scheme No.</label>
            <input type="text" name="schemeNo" className="chat-input" onChange={handleInputChange} required />
          </div>
          <div className="chat-form-row">
            <div className="chat-form-group">
              <label className="chat-label">Department</label>
              <input type="text" name="department" className="chat-input" onChange={handleInputChange} required />
            </div>
            <div className="chat-form-group">
              <label className="chat-label">Semester</label>
              <input type="text" name="semester" className="chat-input" onChange={handleInputChange} required />
            </div>
          </div>
          <div className="chat-form-group">
            <label className="chat-label">Subject</label>
            <select name="subjectId" className="chat-select" onChange={handleInputChange} required>
              <option value="">Select Subject</option>
              {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
          </div>
          <div className="chat-form-group">
            <label className="chat-label">Total Marks (45 - 90)</label>
            <input type="number" name="totalMarks" className="chat-input" value={formData.totalMarks} onChange={handleInputChange} min="45" max="90" required />
          </div>
          <button type="submit" className="chat-submit-btn" disabled={isGenerating}>
            {isGenerating ? 'Processing...' : 'Generate Paper'}
          </button>
        </form>
      </div>
      <div className="chat-output-section">
        <h2 className="chat-title">Question Paper</h2>
        {statusMessage && <div className="chat-status">🔄 {statusMessage}</div>}
        <div className="chat-markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {generatedQuestion || "### Fill the form to generate a paper."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;