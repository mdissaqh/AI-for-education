const { ChatMistralAI } = require("@langchain/mistralai");
const { HumanMessage } = require("@langchain/core/messages");
const Material = require('../models/Material');
const axios = require('axios');
const { PdfReader } = require('pdfreader');
require('dotenv').config();

const handleGenerationError = (socket, error) => {
  const errorMessage = error?.message || "An unexpected AI generation error occurred.";
  socket.emit('question_error', errorMessage);
};

const extractTextFromPDF = async (pdfUrl, socket, index, type) => {
  try {
    socket.emit('question_status', `Downloading ${type} document ${index + 1}...`);
    
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const buffer = Buffer.from(response.data);
    
    const header = buffer.toString('utf8', 0, 5);
    if (header !== '%PDF-') {
      const errorText = buffer.toString('utf8', 0, 200);
      throw new Error(`File is not a PDF. Server returned: ${errorText}`);
    }

    const extractedText = await new Promise((resolve, reject) => {
        let text = "";
        new PdfReader().parseBuffer(buffer, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve(text);
            else if (item.text) text += item.text + "\n";
        });
    });
    
    const cleanedText = extractedText.replace(/\x00/g, '').replace(/\n+/g, '\n').trim();
    
    if (cleanedText.length < 50) {
      throw new Error("File has no readable OCR text (less than 50 characters).");
    }

    socket.emit('question_status', `Successfully extracted ${cleanedText.length} characters from ${type} ${index + 1}.`);
    
    return cleanedText.substring(0, 15000); 
  } catch (error) {
    console.log("\n=============================================");
    console.log(`CRITICAL ERROR EXTRACTING: ${type} ${index + 1}`);
    console.log(`URL ATTEMPTED: ${pdfUrl}`);
    console.log(`ERROR MESSAGE: ${error.message}`);
    console.log("=============================================\n");

    socket.emit('question_status', `Extraction Failed for ${type} ${index + 1}: ${error.message}`);
    return ""; 
  }
};

const generateQuestion = async (socket, data) => {
  try {
    const { subjectId } = data;

    if (!subjectId) throw new Error("Subject ID is missing.");
    if (!process.env.MISTRAL_API_KEY) throw new Error("Mistral API key is not configured.");

    socket.emit('question_status', 'Connecting to Mistral Small engine...');

    const aiModel = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey: process.env.MISTRAL_API_KEY,
      streaming: true
    });

    socket.emit('question_status', 'Retrieving material links from the database...');
    
    const materials = await Material.find({ subject: subjectId });
    
    if (!materials || materials.length === 0) {
      throw new Error("No materials found for the selected subject.");
    }

    const pyqUrls = materials.filter(m => m.category === 'PYQs').map(m => m.pdfUrl);
    const notesUrls = materials.filter(m => m.category === 'Notes').map(m => m.pdfUrl);

    let pyqsText = "";
    for (let i = 0; i < pyqUrls.length; i++) {
      pyqsText += await extractTextFromPDF(pyqUrls[i], socket, i, 'PYQ') + "\n\n";
    }

    let notesText = "";
    for (let i = 0; i < notesUrls.length; i++) {
      notesText += await extractTextFromPDF(notesUrls[i], socket, i, 'Notes') + "\n\n";
    }

    if (!pyqsText.trim() && !notesText.trim()) {
      throw new Error("Could not extract readable text from any of the PDFs. Check your Node.js terminal for the exact error logs.");
    }

    socket.emit('question_status', 'Analyzing document context and generating question...');

    const prompt = `You are an AI educational assistant.
    Review the following extracted text from Previous Year Questions (PYQs) and Notes.
    Based strictly on these concepts, generate a highly probable practice question for the student.
    
    Extracted PYQs Text:
    ${pyqsText}
    
    Extracted Notes Text:
    ${notesText}
    
    Generate the question clearly, and provide a brief hint based on the notes. Do not output anything unrelated to the extracted text.`;

    const message = new HumanMessage({
      content: prompt
    });

    const stream = await aiModel.stream([message]);

    for await (const chunk of stream) {
      socket.emit('question_chunk', chunk.content);
    }

    socket.emit('question_complete');
  } catch (error) {
    console.log("FINAL GENERATION ERROR:", error.message);
    handleGenerationError(socket, error);
  }
};

module.exports = {
  generateQuestion
};