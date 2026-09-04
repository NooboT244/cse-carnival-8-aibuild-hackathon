import express from 'express';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    let reply = `I received your message: "${message}".`;

    const lowerQuery = message.toLowerCase();
    if (lowerQuery.includes('room') || lowerQuery.includes('free')) {
      reply = 'Currently, Room 7A04 and 7C01 are unreserved for open study sessions.';
    } else if (lowerQuery.includes('assignment') || lowerQuery.includes('pending')) {
      reply = 'You have 1 pending task: "Assignment 1: Bayes Classifier Implementation" due on 2026-09-09.';
    } else if (lowerQuery.includes('class') || lowerQuery.includes('next')) {
      reply = 'Your next rescheduled class is CSE 4113 on Sunday, 7th September at 3:30 PM in Room 7A04.';
    }

    return res.json({ reply });
  } catch (error) {
    console.error('AI chat endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;