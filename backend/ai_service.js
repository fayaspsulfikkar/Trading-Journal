const { OpenAI } = require('openai');

async function getTradeFeedback(tradeData) {
  const hasKey = !!process.env.OPENAI_API_KEY;

  if (hasKey) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `
You are a strict trading coach for a beginner forex trader attempting The 5%ers prop firm evaluation. 
Rules: EURUSD only, minimum 1:2 risk reward, stop loss mandatory, max 3 trades per day, 0.01 lot size only.

Here is the trade logged:
Direction: ${tradeData.direction}
Entry: ${tradeData.entry}
Stop Loss: ${tradeData.stop_loss}
Take Profit: ${tradeData.take_profit}
Exit Price: ${tradeData.exit_price}
Risk:Reward: ${tradeData.rr}
Reason: ${tradeData.reason}
Emotion: ${tradeData.emotion}

Return feedback as a structured JSON object with the following EXACT keys:
{
  "entry_logic_rating": "Good / Fair / Poor (with a short generic explanation)",
  "risk_reward_assessment": "Short assessment of the risk reward ratio",
  "emotional_state_flag": "Warning or approval based on the emotion selected",
  "one_thing_done_well": "Short text",
  "one_thing_to_improve": "Short text",
  "letter_grade": "A, B, C, or D"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You reply strictly with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return response.choices[0].message.content;
    } catch (err) {
      console.error("OpenAI API Error:", err);
      // Fallback to mock below if it fails
    }
  }

  // MOCK FEEDBACK
  const isLoss = tradeData.pnl < 0;
  const goodEmotion = ['Calm'].includes(tradeData.emotion);
  
  let grade = 'B';
  if (isLoss && !goodEmotion) grade = 'C';
  if (!isLoss && goodEmotion) grade = 'A';
  if (tradeData.emotion === 'Revenge') grade = 'D';

  const mockFeedback = {
    entry_logic_rating: isLoss ? "Fair - Entry was reasonable but market reversed." : "Good - Solid entry following trends.",
    risk_reward_assessment: tradeData.rr >= 2 ? "Excellent - Adhered to the 1:2 minimum rule." : "Poor - Did not meet 1:2 minimum.",
    emotional_state_flag: goodEmotion ? "Great mindset, keep staying calm." : "Careful, strong emotions tend to lead to mistakes.",
    one_thing_done_well: "Used a hard stop loss to protect capital.",
    one_thing_to_improve: "Ensure you double-check higher timeframe confirmations next time.",
    letter_grade: grade
  };

  return JSON.stringify(mockFeedback);
}

module.exports = { getTradeFeedback };
