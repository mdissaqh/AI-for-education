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
    const { subjectId, totalMarks } = data;

    if (!subjectId) throw new Error("Subject ID is missing.");
    if (totalMarks < 45 || totalMarks > 90) {
      throw new Error("Total marks must be between 45 and 90.");
    }
    if (!process.env.MISTRAL_API_KEY) throw new Error("Mistral API key missing.");

    socket.emit('question_status', 'Analyzing study materials and mapping page numbers...');

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

    socket.emit('question_status', `Generating a ${totalMarks} marks paper with answers and citations...`);

    const prompt = `You are a university professor. Generate a question paper and detailed answers based ONLY on the context provided.
    
    CONSTRAINTS:
    1. The total sum of marks for all questions MUST be exactly ${totalMarks}.
    2. Use 2-mark, 5-mark, and 10-mark questions.
    3. State the marks for each question.
    4. Immediately after each question, provide the ANSWER.
    5. Answers MUST be derived STRICTLY from the NOTES provided below. Do not invent information.
    6. MANDATORY: At the end of EVERY answer, provide a reference citation with the exact Page Number and a clickable Source Document URL. Format exactly like this: **Reference:** Page X - [View Source Document](URL). Identify the page number from the [PAGE X] tags in the text. Use the SOURCE DOCUMENT URL provided at the start of the notes.
    7. Provide a total marks summary at the end.
    8. Use Markdown formatting (## for headers, **bold** for emphasis).
    
    PYQS (Use to understand question patterns):
    ${pyqsData}
    
    NOTES (Use STRICTLY to extract answers and page citations):
    ${notesData}`;

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