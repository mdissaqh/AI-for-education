const { ChatMistralAI } = require("@langchain/mistralai");
const { HumanMessage } = require("@langchain/core/messages");
const Material = require('../models/Material');
const axios = require('axios');
const PDFParser = require("pdf2json");
require('dotenv').config();

const extractTextFromPDF = async (pdfUrl, socket) => {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const buffer = Buffer.from(response.data);
    const originalLog = console.log;
    const originalWarn = console.warn;

    const extractedText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      console.log = () => {};
      console.warn = () => {};

      pdfParser.on("pdfParser_dataError", errData => {
        console.log = originalLog;
        console.warn = originalWarn;
        reject(errData.parserError);
      });

      pdfParser.on("pdfParser_dataReady", () => {
        console.log = originalLog;
        console.warn = originalWarn;
        resolve(pdfParser.getRawTextContent());
      });
      
      pdfParser.parseBuffer(buffer);
    });

    let cleanedText = extractedText.replace(/----------------Page \((\d+)\) Break----------------/g, (match, p1) => {
      return `\n\n[PAGE ${parseInt(p1) + 1}]\n\n`;
    });

    cleanedText = cleanedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    
    if (cleanedText.length < 50) return "";
    
    return `\n--- SOURCE DOCUMENT URL: ${pdfUrl} ---\n${cleanedText.substring(0, 20000)}`; 
  } catch (error) {
    return ""; 
  }
};

const generateQuestion = async (socket, data) => {
  try {
    const { subjectId, totalMarks, isMockTest } = data;
    const targetMarks = isMockTest ? 100 : totalMarks;

    if (!subjectId) throw new Error("Subject ID is missing.");
    if (!isMockTest && (totalMarks < 45 || totalMarks > 90)) {
      throw new Error("Total marks must be between 45 and 90.");
    }
    if (!process.env.MISTRAL_API_KEY) throw new Error("Mistral API key missing.");

    socket.emit('question_status', 'Analyzing study materials...');

    const aiModel = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey: process.env.MISTRAL_API_KEY,
      streaming: true
    });

    const materials = await Material.find({ subject: subjectId });
    if (!materials || materials.length === 0) throw new Error("No materials found.");

    const pyqUrls = materials.filter(m => m.category === 'PYQs').map(m => m.pdfUrl);
    const notesUrls = materials.filter(m => m.category === 'Notes').map(m => m.pdfUrl);

    let pyqsData = "";
    for (let i = 0; i < pyqUrls.length; i++) {
      pyqsData += await extractTextFromPDF(pyqUrls[i], socket) + "\n";
    }

    let notesData = "";
    for (let i = 0; i < notesUrls.length; i++) {
      notesData += await extractTextFromPDF(notesUrls[i], socket) + "\n";
    }

    if (!pyqsData.trim() && !notesData.trim()) throw new Error("Could not extract readable text.");

    let prompt = "";
    
    if (isMockTest) {
      socket.emit('question_status', `Generating 100 marks Mock Test based on PYQs...`);
      prompt = `You are a university professor. Generate a mock test question paper based ONLY on the PYQs context provided.
      
      CONSTRAINTS:
      1. Total sum of marks MUST be exactly 100.
      2. Provide ONLY the questions without answers.
      3. CRITICAL: Every single question or sub-question (like 1a, 1b) MUST start on a new line with the exact prefix "### Question ". Example: "### Question 1a: [8 Marks] Explain..."
      4. Do not include any introductory or concluding text. Just the formatted questions.
      
      PYQS:
      ${pyqsData}`;
    } else {
      socket.emit('question_status', `Generating a ${targetMarks} marks paper with answers and citations...`);
      prompt = `You are a university professor. Generate a question paper and detailed answers based ONLY on the context provided.
      
      CONSTRAINTS:
      1. Total sum of marks MUST be exactly ${targetMarks}.
      2. Use 2-mark, 5-mark, and 10-mark questions. State marks for each.
      3. Immediately after each question, provide the ANSWER derived STRICTLY from the NOTES.
      4. MANDATORY: At the end of EVERY answer, provide a citation format: **Reference:** Page X - [View Source Document](URL).
      
      PYQS:
      ${pyqsData}
      
      NOTES:
      ${notesData}`;
    }

    const stream = await aiModel.stream([new HumanMessage({ content: prompt })]);

    for await (const chunk of stream) {
      socket.emit('question_chunk', chunk.content);
    }

    socket.emit('question_complete');
  } catch (error) {
    socket.emit('question_error', error.message);
  }
};

const evaluateTest = async (socket, data) => {
  try {
    const { subjectId, compiledAnswers } = data;

    if (!process.env.MISTRAL_API_KEY) throw new Error("Mistral API key missing.");

    socket.emit('evaluation_status', 'Evaluating your answers against the official notes...');

    const aiModel = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey: process.env.MISTRAL_API_KEY,
      streaming: true
    });

    const materials = await Material.find({ subject: subjectId });
    const notesUrls = materials.filter(m => m.category === 'Notes').map(m => m.pdfUrl);

    let notesData = "";
    for (let i = 0; i < notesUrls.length; i++) {
      notesData += await extractTextFromPDF(notesUrls[i], socket) + "\n";
    }

    const prompt = `You are a strict university examiner evaluating a student's mock test.
    
    STUDENT SUBMISSION (Questions and their Answers):
    ${compiledAnswers}
    
    OFFICIAL NOTES FOR VERIFICATION:
    ${notesData}
    
    CONSTRAINTS:
    1. Evaluate strictly based on the OFFICIAL NOTES.
    2. Provide constructive feedback and assign marks obtained out of the total marks for each question.
    3. Provide the FINAL TOTAL SCORE out of 100 at the top of your response.
    4. Use Markdown formatting.`;

    const stream = await aiModel.stream([new HumanMessage({ content: prompt })]);

    for await (const chunk of stream) {
      socket.emit('evaluation_chunk', chunk.content);
    }

    socket.emit('evaluation_complete');
  } catch (error) {
    socket.emit('evaluation_error', error.message);
  }
};

module.exports = { generateQuestion, evaluateTest };