const OpenAI = require('openai');

const DEFAULT_MESSAGE =
  '오늘 과제 하느라 고생 많았어요. 남은 건 내일 에너지가 좋을 때 제가 대신 배치해 드릴게요!';

let openaiClient = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * 할 일을 마치지 못했을 때, 사용자에게 심리적 위로와 재조정 메시지를 생성하는 함수.
 * OpenAI API를 사용하며, 문제가 생기면 기본 메시지로 fallback 합니다.
 */
async function createCareMessage({ name = '민준', title = '', count = 0 } = {}) {
  const client = getClient();
  if (!client) {
    return DEFAULT_MESSAGE;
  }

  try {
    const prompt = [
      `사용자 이름: ${name}`,
      title ? `할 일 제목: ${title}` : '',
      `미룬 횟수: ${count}`,
      '',
      '조건:',
      '1. 한국어로만 답변합니다.',
      '2. 다정하고 부담을 덜어주는 톤으로 위로합니다.',
      "3. '실패', '게으름' 같은 부정적인 단어는 사용하지 않습니다.",
      "4. 오늘 할 일을 다 못해도 괜찮고, 내일 에너지가 좋을 때 다시 재조정할 수 있다는 메시지를 전달합니다.",
      '5. 1~2문장, 최대 80자로 짧게 답변합니다.',
      '',
      '예시 톤:',
      "오늘 과제 하느라 고생 많았어요. 남은 건 내일 에너지가 좋을 때 제가 대신 배치해 드릴게요!",
    ]
      .filter(Boolean)
      .join('\n');

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '너는 할 일을 끝내지 못한 사용자를 다정하게 위로해 주는 심리 케어 어시스턴트야.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const message = response.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return DEFAULT_MESSAGE;
    }
    return message;
  } catch (err) {
    console.error('OpenAI 위로 메시지 생성 중 오류:', err.message);
    return DEFAULT_MESSAGE;
  }
}

module.exports = {
  createCareMessage,
  DEFAULT_MESSAGE,
};

