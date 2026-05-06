import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useChat } from '../hook/useChat';
import '../style/chat.css';

const Dashboard = () => {
  const { generatedQuestion, isGenerating, statusMessage, error, subjects, loadSubjects, generatePyqQuestion, isMockTestMode, formatTime, triggerMockTest, studentAnswers, handleAnswerChange, submitTest, isEvaluating, evaluationResult, chatMessages, isChatLoading, sendChatMessage } = useChat();
  
  const [formData, setFormData] = useState({ schemeNo: '', department: '', semester: '', subjectId: '', totalMarks: 45 });
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (formData.schemeNo && formData.department && formData.semester) {
      loadSubjects(formData.schemeNo, formData.department, formData.semester);
    }
  }, [formData.schemeNo, formData.department, formData.semester]);

  useEffect(() => {
    if (isMockTestMode && !isGenerating && generatedQuestion && !evaluationResult) {
      const parts = generatedQuestion.split(/(?=### Question)/);
      const formatted = parts.map((part, idx) => ({ id: idx, text: part.trim() })).filter(p => p.text);
      setParsedQuestions(formatted);
    }
  }, [isMockTestMode, isGenerating, generatedQuestion, evaluationResult]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); generatePyqQuestion(formData.subjectId, formData.totalMarks); };
  
  const onAutoExpand = (e, id) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    handleAnswerChange(id, e.target.value);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendChatMessage(formData.subjectId, chatInput);
    setChatInput('');
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
          <button type="submit" className="chat-submit-btn" disabled={isGenerating || isEvaluating}>
            {isGenerating && !isMockTestMode ? 'Processing...' : 'Generate Practice Paper'}
          </button>
        </form>
      </div>

      <div className="chat-output-section">
        <div className="chat-output-header">
          <h2 className="chat-title">Output Console</h2>
          <div className="action-buttons-top-right">
            <button className="mock-test-btn" onClick={() => triggerMockTest(formData.subjectId)} disabled={isGenerating || isEvaluating}>
              {isMockTestMode && isGenerating ? 'Preparing Test...' : 'Start Mock Test (100M)'}
            </button>
          </div>
        </div>

        {isMockTestMode && !isGenerating && !evaluationResult && parsedQuestions.length > 0 && (
          <div className="test-controls-top">
            <div className="timer-display">Time Remaining: <span>{formatTime()}</span></div>
            <button className="submit-test-btn-top" onClick={() => submitTest(formData.subjectId, parsedQuestions)} disabled={isEvaluating}>
              {isEvaluating ? 'Evaluating...' : 'Submit Test for Evaluation'}
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="chat-status-msg-giant">
            <Loader2 className="spinner-icon" size={48} />
            <p>{statusMessage}</p>
          </div>
        )}

        {!statusMessage && isMockTestMode && !isGenerating && !evaluationResult && parsedQuestions.length > 0 && (
          <div className="mock-test-container">
            {parsedQuestions.map((q) => (
              <div key={q.id} className="mock-question-block">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.text}</ReactMarkdown>
                <textarea 
                  className="auto-expand-textarea" 
                  value={studentAnswers[q.id] || ''} 
                  onChange={(e) => onAutoExpand(e, q.id)} 
                  placeholder="Type your answer here..."
                />
              </div>
            ))}
          </div>
        )}

        {!statusMessage && (!isMockTestMode || evaluationResult) && (
          <div className="chat-stream-box">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {evaluationResult || generatedQuestion || "### Select a subject and generate a paper."}
            </ReactMarkdown>
          </div>
        )}

      </div>

      <button className="floating-chat-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isChatOpen && (
        <div className="floating-chat-window">
          <div className="chat-window-header">
            <h3>AI Tutor</h3>
            <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
          </div>
          <div className="chat-window-body">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            ))}
            {isChatLoading && <div className="chat-bubble ai typing">Typing...</div>}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-window-input" onSubmit={handleChatSubmit}>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a doubt..." disabled={isChatLoading} />
            <button type="submit" disabled={!chatInput.trim() || isChatLoading}><Send size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;