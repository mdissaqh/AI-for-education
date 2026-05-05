const { ChatMistralAI } = require("@langchain/mistralai");
const { HumanMessage } = require("@langchain/core/messages");
const Material = require('../models/Material');
require('dotenv').config();

const handleGenerationError = (socket, error) => {
  const errorMessage = error?.message || "An unexpected AI generation error occurred.";
  socket.emit('question_error', errorMessage);
};

const generateQuestion = async (socket, data) => {
  try {
    const { subjectId } = data;

    if (!subjectId) {
      throw new Error("Subject ID is missing.");
    }

    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("Mistral API key is not configured.");
    }

    socket.emit('question_status', 'Connecting to Mistral Small engine...');

    const aiModel = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey: process.env.MISTRAL_API_KEY,
      streaming: true
    });

    socket.emit('question_status', 'Retrieving materials from the database...');
    
    const materials = await Material.find({ subject: subjectId });
    
    if (!materials || materials.length === 0) {
      throw new Error("No materials found for the selected subject.");
    }

    const pyqs = materials.filter(m => m.category === 'PYQs').map(m => m.pdfUrl).join('\n');
    const notes = materials.filter(m => m.category === 'Notes').map(m => m.pdfUrl).join('\n');

    socket.emit('question_status', 'Analyzing patterns and generating question...');

    const prompt = `You are an AI educational assistant.
    Review the following AWS S3 material links. Based on the patterns typically found in PYQs and Notes, generate a highly probable practice question for the student.
    
    Reference PYQs:
    ${pyqs}
    
    Reference Notes:
    ${notes}
    
    Generate the question clearly, and provide a brief hint based on the notes.`;

    const message = new HumanMessage({
      content: prompt
    });

    const stream = await aiModel.stream([message]);

    for await (const chunk of stream) {
      socket.emit('question_chunk', chunk.content);
    }

    socket.emit('question_complete');
  } catch (error) {
    handleGenerationError(socket, error);
  }
};

module.exports = {
  generateQuestion
};