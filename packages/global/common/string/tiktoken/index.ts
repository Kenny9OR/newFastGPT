/* Only the token of gpt-3.5-turbo is used */
import type { ChatItemType } from '../../../core/chat/type';
import { Tiktoken } from 'js-tiktoken/lite';
import { chats2GPTMessages } from '../../../core/chat/adapt';
import encodingJson from './cl100k_base.json';
import { ChatCompletionMessageParam, ChatCompletionContentPart } from '../../../core/ai/type';
import { ChatRoleEnum } from '../../../core/chat/constants';
import { ChatCompletionRequestMessageRoleEnum } from '../../../core/ai/constants';

/* init tikToken obj */
export function getTikTokenEnc() {
  if (typeof window !== 'undefined' && window.TikToken) {
    return window.TikToken;
  }
  if (typeof global !== 'undefined' && global.TikToken) {
    return global.TikToken;
  }

  const enc = new Tiktoken(encodingJson);

  if (typeof window !== 'undefined') {
    window.TikToken = enc;
  }
  if (typeof global !== 'undefined') {
    global.TikToken = enc;
  }

  return enc;
}

/* count one prompt tokens */
export function countPromptTokens(
  prompt: string | ChatCompletionContentPart[] | null | undefined = '',
  role: '' | `${ChatCompletionRequestMessageRoleEnum}` = '',
  tools?: any
) {
  const enc = getTikTokenEnc();

  const promptText = (() => {
    if (!prompt) return '';
    if (typeof prompt === 'string') return prompt;
    let promptText = '';
    prompt.forEach((item) => {
      if (item.type === 'text') {
        promptText += item.text;
      } else if (item.type === 'image_url') {
        promptText += item.image_url.url;
      }
    });
    return promptText;
  })();
  const toolText = tools
    ? JSON.stringify(tools)
        .replace('"', '')
        .replace('\n', '')
        .replace(/( ){2,}/g, ' ')
    : '';

  const text = `${role}\n${promptText}\n${toolText}`.trim();

  try {
    const encodeText = enc.encode(text);
    const supplementaryToken = role ? 4 : 0;
    return encodeText.length + supplementaryToken;
  } catch (error) {
    return text.length;
  }
}

/* count messages tokens */
export const countMessagesTokens = (messages: ChatItemType[]) => {
  const adaptMessages = chats2GPTMessages({ messages, reserveId: true });

  return countGptMessagesTokens(adaptMessages);
};
export const countGptMessagesTokens = (messages: ChatCompletionMessageParam[], tools?: any) =>
  messages.reduce((sum, item) => sum + countPromptTokens(item.content, item.role, tools), 0);

/* slice messages from top to bottom by maxTokens */
export function sliceMessagesTB({
  messages,
  maxTokens
}: {
  messages: ChatItemType[];
  maxTokens: number;
}) {
  const adaptMessages = chats2GPTMessages({ messages, reserveId: true });
  let reduceTokens = maxTokens;
  let result: ChatItemType[] = [];

  for (let i = 0; i < adaptMessages.length; i++) {
    const item = adaptMessages[i];

    const tokens = countPromptTokens(item.content, item.role);
    reduceTokens -= tokens;

    if (reduceTokens > 0) {
      result.push(messages[i]);
    } else {
      break;
    }
  }

  return result.length === 0 && messages[0] ? [messages[0]] : result;
}
