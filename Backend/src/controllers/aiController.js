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

    const cleanedText = extractedText.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanedText.length < 50) return "";
    
    return cleanedText.substring(0, 12000); 
  } catch (error) {
    return ""; 
  }
};

const generateQuestion = async (socket, data) => {
  try {
    const { subjectId, totalMarks } = data;

    if (!subjectId) throw new Error("Subject ID is missing.");
    if (totalMarks < 45 || totalMarks > 90) {
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

    let contextData = "";
    for (let i = 0; i < pyqUrls.length; i++) {
      contextData += await extractTextFromPDF(pyqUrls[i], socket) + "\n";
    }
    for (let i = 0; i < notesUrls.length; i++) {
      contextData += await extractTextFromPDF(notesUrls[i], socket) + "\n";
    }

    if (!contextData.trim()) throw new Error("Could not extract readable text.");

    socket.emit('question_status', `Generating a ${totalMarks} marks paper...`);

    const prompt = `You are a university professor. Generate a question paper based ONLY on the context provided.
    
    CONSTRAINTS:
    1. The total sum of marks for all questions MUST be exactly ${totalMarks}.
    2. Use 2-mark, 5-mark, and 10-mark questions.
    3. State the marks for each question.
    4. Provide a total marks summary at the end.
    
    CONTEXT:
    ${contextData}`;

    const stream = await aiModel.stream([new HumanMessage({ content: prompt })]);

    for await (const chunk of stream) {
      socket.emit('question_chunk', chunk.content);
    }

    socket.emit('question_complete');
  } catch (error) {
    socket.emit('question_error', error.message);
  }
};

module.exports = { generateQuestion };