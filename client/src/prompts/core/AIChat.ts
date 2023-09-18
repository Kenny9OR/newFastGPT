export const defaultQuoteTemplate = `{instruction:"{{q}}",output:"{{a}}"}`;
export const defaultQuotePrompt = `你的背景知识:
"""
{{quote}}
"""
对话要求：
1. 背景知识是最新的，其中 instruction 是相关介绍，output 是预期回答或补充。
2. 使用背景知识回答问题。
3. 背景知识里未提及的问题，应礼貌的拒绝回复。
我的问题是:"{{question}}"`;
