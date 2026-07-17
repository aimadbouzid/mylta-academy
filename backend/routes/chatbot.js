const express = require('express');
const router = express.Router();
const nlpManager = require('../chatbot/nlpManager');

// POST /api/chat
// Reçoit un message utilisateur et renvoie la réponse de l'IA locale
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Le message est vide.' });
    }

    const answer = await nlpManager.processMessage(message);
    
    res.json({ reply: answer });
  } catch (error) {
    console.error('Erreur API Chatbot:', error);
    res.status(500).json({ error: 'Erreur serveur du chatbot.' });
  }
});

module.exports = router;
