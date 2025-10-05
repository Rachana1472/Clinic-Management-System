import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import ChatMessage from '../models/ChatMessage';
import { requireUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Simple local responder used when GROQ_API_KEY is not configured
function generateLocalResponse(message: string): string {
  const text = (message || '').toLowerCase();
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const greetings = [
    "Hi, I'm here with you. How are you feeling right now?",
    "Hello. Thanks for reaching out—what's on your mind?",
    "Hey, I'm listening. Want to tell me a bit more about it?"
  ];

  const anxiety = [
    `It sounds like anxiety is showing up. Try taking 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 6. What usually helps you feel a little safer?`,
    `Those anxious waves can feel intense. Try a slow exhale (6 counts). What triggered it today?`
  ];

  const lowMood = [
    `I'm sorry it's heavy. Small steps help—maybe a glass of water or a short stretch. What would feel kind to yourself right now?`,
    `Feeling low can be exhausting. You matter. Would writing down one worry help externalize it?`
  ];

  const stress = [
    `Stress piles up fast. Let’s prioritize: what is one small task you can do next?`,
    `Your nervous system might need a micro-break. 5 slow breaths, shoulders down, unclench jaw.`
  ];

  const sleep = [
    `Sleep troubles are tough. Try dimming lights, avoiding screens 30 minutes before bed, and a calm breath pattern (4-4-6).`,
    `If your mind is racing, a quick brain dump on paper can help before bed.`
  ];

  const anger = [
    `Anger is a valid signal. If safe, step back, cool water on wrists, and name what boundary was crossed.`,
    `Let’s channel it safely: paced breathing and a short walk can release tension.`
  ];

  const panic = [
    `Panic can feel scary but it will pass. Look around and name 5 things you can see. I’m here with you.`,
    `Place a hand on your chest and feel the rise and fall—let your exhale be longer than your inhale.`
  ];

  const relationship = [
    `Relationships are complex. Would you like to try an “I feel… when… I need…” statement?`,
    `Can we clarify the need underneath the conflict? What are you hoping to feel more of?`
  ];

  const workStudy = [
    `Work/study stress is real. Let’s chunk it: pick a 15‑minute focus block, then a 2‑minute break.`,
    `Try the 1–3 priority list for today: one must‑do, two nice‑to‑do.`
  ];

  const physical = [
    `Headaches/fever can make everything harder. Hydrate, rest your eyes, and notice any triggers. If symptoms persist or worsen, consider medical advice. Emotionally—what’s the biggest worry behind it?`,
    `Your body is asking for care. Gentle rest, water, and light food may help. If pain or fever continues, a healthcare check is wise. How are you feeling emotionally about it?`
  ];

  const generic = [
    `I hear you. Try taking 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 6. If it helps, share a bit more about what happened today so we can unpack it together.`,
    `Thanks for opening up. Let's take one small step: what is one thing within your control right now?`,
    `You don't have to carry this alone. Would naming your top concern in one sentence help us focus?`,
    `Let's slow it down together—long exhale, relaxed shoulders. What support would feel most helpful right now?`
  ];

  const crisis = [
    `If you’re thinking about harming yourself or others, your safety matters most. Please contact local emergency services or a trusted person right now. If available, consider your country’s crisis hotline.`
  ];

  // Intent detection (very simple keyword scan)
  const has = (k: string[]) => k.some(w => text.includes(w));

  if (has(["suicide", "self harm", "hurt myself", "end it", "kill myself"])) {
    return crisis[0];
  }
  if (has(["panic", "panic attack", "heart racing"])) return pick(panic);
  if (has(["anxiety", "anxious", "worry", "worried"])) return pick(anxiety);
  if (has(["depress", "sad", "down", "empty"])) return pick(lowMood);
  if (has(["stress", "overwhelmed", "overwhelm", "burnout"])) return pick(stress);
  if (has(["sleep", "insomnia", "can't sleep", "cant sleep"])) return pick(sleep);
  if (has(["angry", "anger", "rage"])) return pick(anger);
  if (has(["partner", "relationship", "breakup", "friend", "family"])) return pick(relationship);
  if (has(["work", "office", "deadline", "study", "exam", "college", "school"])) return pick(workStudy);
  if (has(["fever", "headache", "pain", "sick", "ill", "nausea"])) return pick(physical);
  if (has(["hi", "hello", "hey"])) return pick(greetings);

  return pick(generic);
}

// Route to handle sending a message to the chatbot
router.post(
  '/send',
  [
    requireUser, // Ensures the user is logged in
    body('message').trim().notEmpty().withMessage('Message cannot be empty.'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string.'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      console.log('[Chatbot] Received request with body:', JSON.stringify(req.body, null, 2));
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, sessionId: existingSessionId } = req.body;
      const sessionId = existingSessionId || `session_${Date.now()}`;

      // Save the user's message to the database
      const userMessage = new ChatMessage({
        user: req.user?._id,
        sessionId,
        message,
        messageType: 'user',
      });
      await userMessage.save();

      // Generate simple response
      const aiResponse = generateLocalResponse(message);
      
      // Save the AI's response to the database
      const aiMessage = new ChatMessage({
        user: req.user?._id,
        sessionId,
        message: aiResponse,
        messageType: 'ai',
      });
      await aiMessage.save();

      // Return the AI's message and the session ID
      return res.json({
        aiMessage,
        sessionId,
      });
    } catch (error) {
      console.error('[Chatbot] Error:', error);
      return next(error);
    }
  }
);

// Get chat history
router.get('/history', requireUser, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId, page = 1, limit = 50 } = req.query;
    const filter: any = { user: req.user?._id };

    if (sessionId) {
      filter.sessionId = sessionId;
    }

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string) * 1)
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await ChatMessage.countDocuments(filter);

    return res.json({
      messages: messages.reverse(), // Return in chronological order
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      total
    });
  } catch (error) {
    return next(error);
  }
});

// Get chat sessions
router.get('/sessions', requireUser, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $match: { user: req.user?._id } },
      { $group: { _id: '$sessionId', lastMessage: { $last: '$message' }, lastTimestamp: { $last: '$createdAt' } } },
      { $sort: { lastTimestamp: -1 } }
    ]);

    return res.json({ sessions });
  } catch (error) {
    return next(error);
  }
});


export default router; 