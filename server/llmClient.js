const axios = require('axios');
const { AppError } = require('./errors');

const createLlmClient = ({ endpoint, apiKey, mockResponse, logger }) => {
    return {
        async ask(prompt) {
            if (!prompt) {
                throw new AppError('A prompt is required to query the LLM API.', 400);
            }

            if (mockResponse) {
                return { answer: mockResponse };
            }

            if (!endpoint || !apiKey) {
                throw new AppError('LLM API credentials are not configured.', 503);
            }

            try {
                const { data } = await axios.post(
                    endpoint,
                    { prompt, max_tokens: 300 },
                    {
                        headers: { Authorization: `Bearer ${apiKey}` },
                        timeout: 10000,
                    }
                );

                if (!data) {
                    throw new AppError('The LLM API returned an empty response.', 502);
                }

                const answer = data?.answer ?? data?.result ?? data?.outputText ?? data?.response;
                return {
                    answer: typeof answer === 'string' ? answer : JSON.stringify(data),
                    raw: data,
                };
            } catch (error) {
                const message = error.response?.data?.error || error.message;
                if (logger) {
                    logger.error({ err: error }, 'LLM request failed');
                }
                throw new AppError(message || 'Unable to reach the LLM API.', 502);
            }
        },
    };
};

module.exports = { createLlmClient };
