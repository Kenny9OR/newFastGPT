import { PgClient } from '@/service/pg';
import { ModelDataStatusEnum, ModelVectorSearchModeEnum, ChatModelMap } from '@/constants/model';
import { ModelSchema } from '@/types/mongoSchema';
import { openaiCreateEmbedding } from '../utils/chat/openai';
import { ChatRoleEnum } from '@/constants/chat';
import { modelToolMap } from '@/utils/chat';
import { ChatItemSimpleType } from '@/types/chat';

/**
 *  use openai embedding search kb
 */
export const searchKb = async ({
  userOpenAiKey,
  prompts,
  similarity = 0.2,
  model,
  userId
}: {
  userOpenAiKey?: string;
  prompts: ChatItemSimpleType[];
  model: ModelSchema;
  userId: string;
  similarity?: number;
}): Promise<{
  code: 200 | 201;
  searchPrompts: {
    obj: ChatRoleEnum;
    value: string;
  }[];
}> => {
  async function search(textArr: string[] = []) {
    const limitMap: Record<ModelVectorSearchModeEnum, number> = {
      [ModelVectorSearchModeEnum.hightSimilarity]: 15,
      [ModelVectorSearchModeEnum.noContext]: 15,
      [ModelVectorSearchModeEnum.lowSimilarity]: 20
    };
    // 获取提示词的向量
    const { vectors: promptVectors } = await openaiCreateEmbedding({
      userOpenAiKey,
      userId,
      textArr
    });

    const searchRes = await Promise.all(
      promptVectors.map((promptVector) =>
        PgClient.select<{ id: string; q: string; a: string }>('modelData', {
          fields: ['id', 'q', 'a'],
          where: [
            ['status', ModelDataStatusEnum.ready],
            'AND',
            `kb_id IN (${model.chat.relatedKbs.map((item) => `'${item}'`).join(',')})`,
            'AND',
            `vector <=> '[${promptVector}]' < ${similarity}`
          ],
          order: [{ field: 'vector', mode: `<=> '[${promptVector}]'` }],
          limit: limitMap[model.chat.searchMode]
        }).then((res) => res.rows)
      )
    );

    // Remove repeat record
    const idSet = new Set<string>();
    const filterSearch = searchRes.map((search) =>
      search.filter((item) => {
        if (idSet.has(item.id)) {
          return false;
        }
        idSet.add(item.id);
        return true;
      })
    );

    return filterSearch.map((item) => item.map((item) => `${item.q}\n${item.a}`).join('\n'));
  }
  const modelConstantsData = ChatModelMap[model.chat.chatModel];

  // search three times
  const userPrompts = prompts.filter((item) => item.obj === 'Human');

  const searchArr: string[] = [
    userPrompts[userPrompts.length - 1].value,
    userPrompts[userPrompts.length - 2]?.value
  ].filter((item) => item);
  const systemPrompts = await search(searchArr);

  // filter system prompts.
  const filterRateMap: Record<number, number[]> = {
    1: [1],
    2: [0.7, 0.3]
  };
  const filterRate = filterRateMap[systemPrompts.length] || filterRateMap[0];

  // 计算固定提示词的 token 数量
  const fixedPrompts = [
    ...(model.chat.systemPrompt
      ? [
          {
            obj: ChatRoleEnum.System,
            value: model.chat.systemPrompt
          }
        ]
      : []),
    ...(model.chat.searchMode === ModelVectorSearchModeEnum.noContext
      ? [
          {
            obj: ChatRoleEnum.System,
            value: `The knowledge base contains information about "${model.name}" and is used to answer questions based on its content.`
          }
        ]
      : [
          {
            obj: ChatRoleEnum.System,
            value: `Play a question and answer game with the following rules:
1. You completely forget all the knowledge you already have.
2. You can only answer questions about "${model.name}".
3. You can only choose content from the knowledge base to answer.
4. If the question is not in the knowledge base, you will answer: "I don't know."
Please make sure to follow the rules.`
          }
        ])
  ];
  const fixedSystemTokens = modelToolMap[model.chat.chatModel].countTokens({
    messages: fixedPrompts
  });
  const maxTokens = modelConstantsData.systemMaxToken - fixedSystemTokens;

  const filterSystemPrompt = filterRate
    .map((rate, i) =>
      modelToolMap[model.chat.chatModel].sliceText({
        text: systemPrompts[i],
        length: Math.floor(maxTokens * rate)
      })
    )
    .join('\n')
    .trim();

  /* 高相似度+不回复 */
  if (!filterSystemPrompt && model.chat.searchMode === ModelVectorSearchModeEnum.hightSimilarity) {
    return {
      code: 201,
      searchPrompts: [
        {
          obj: ChatRoleEnum.System,
          value: '对不起，你的问题不在知识库中。'
        }
      ]
    };
  }
  /* 高相似度+无上下文，不添加额外知识,仅用系统提示词 */
  if (!filterSystemPrompt && model.chat.searchMode === ModelVectorSearchModeEnum.noContext) {
    return {
      code: 200,
      searchPrompts: model.chat.systemPrompt
        ? [
            {
              obj: ChatRoleEnum.System,
              value: model.chat.systemPrompt
            }
          ]
        : []
    };
  }

  /* 有匹配 */
  return {
    code: 200,
    searchPrompts: [
      {
        obj: ChatRoleEnum.System,
        value: `知识库:${filterSystemPrompt}`
      },
      ...fixedPrompts
    ]
  };
};
