import { AppSimpleEditFormType } from '@fastgpt/global/core/app/type';
import { ModuleItemType } from '@fastgpt/global/core/module/type';
import { FlowNodeInputTypeEnum, FlowNodeTypeEnum } from '@fastgpt/global/core/module/node/constant';
import { ModuleIOValueTypeEnum, ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import { UserInputModule } from '@fastgpt/global/core/module/template/system/userInput';
import { ToolModule } from '@fastgpt/global/core/module/template/system/tools';
import { DatasetSearchModule } from '@fastgpt/global/core/module/template/system/datasetSearch';

export async function postForm2Modules(data: AppSimpleEditFormType) {
  function userGuideTemplate(formData: AppSimpleEditFormType): ModuleItemType[] {
    return [
      {
        name: 'core.module.template.User guide',
        flowType: FlowNodeTypeEnum.userGuide,
        inputs: [
          {
            key: ModuleInputKeyEnum.welcomeText,
            type: FlowNodeInputTypeEnum.hidden,
            label: 'core.app.Welcome Text',
            value: formData.userGuide.welcomeText
          },
          {
            key: ModuleInputKeyEnum.variables,
            type: FlowNodeInputTypeEnum.hidden,
            label: 'core.app.Chat Variable',
            value: formData.userGuide.variables
          },
          {
            key: ModuleInputKeyEnum.questionGuide,
            type: FlowNodeInputTypeEnum.hidden,
            label: 'core.app.Question Guide',
            value: formData.userGuide.questionGuide
          },
          {
            key: ModuleInputKeyEnum.tts,
            type: FlowNodeInputTypeEnum.hidden,
            label: 'core.app.TTS',
            value: formData.userGuide.tts
          }
        ],
        outputs: [],
        position: {
          x: 447.98520778293346,
          y: 721.4016845336229
        },
        moduleId: 'userGuide'
      }
    ];
  }
  function simpleChatTemplate(formData: AppSimpleEditFormType): ModuleItemType[] {
    return [
      {
        moduleId: 'userChatInput',
        name: 'core.module.template.Chat entrance',
        avatar: '/imgs/module/userChatInput.png',
        flowType: 'questionInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        inputs: [
          {
            key: 'userChatInput',
            type: 'systemInput',
            valueType: 'string',
            label: 'core.module.input.label.user question',
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'core.module.input.label.user question',
            type: 'source',
            valueType: 'string',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        name: 'AI 对话',
        avatar: '/imgs/module/AI.png',
        flowType: 'chatNode',
        showStatus: true,
        position: {
          x: 981.9682828103937,
          y: 890.014595014464
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'core.module.input.label.switch',
            valueType: 'any',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'model',
            type: 'selectLLMModel',
            label: 'core.module.input.label.aiModel',
            required: true,
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.aiSettings.model,
            connected: false
          },
          {
            key: 'temperature',
            type: 'hidden',
            label: '温度',
            value: formData.aiSettings.temperature,
            valueType: 'number',
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: '严谨',
                value: 0
              },
              {
                label: '发散',
                value: 10
              }
            ],
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          },
          {
            key: 'maxToken',
            type: 'hidden',
            label: '回复上限',
            value: formData.aiSettings.maxToken,
            valueType: 'number',
            min: 100,
            max: 4000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '4000',
                value: 4000
              }
            ],
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          },
          {
            key: 'isResponseAnswerText',
            type: 'hidden',
            label: '返回AI内容',
            value: true,
            valueType: 'boolean',
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          },
          {
            key: 'quoteTemplate',
            type: 'hidden',
            label: '引用内容模板',
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.aiSettings.quoteTemplate,
            connected: false
          },
          {
            key: 'quotePrompt',
            type: 'hidden',
            label: '引用内容提示词',
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.aiSettings.quotePrompt,
            connected: false
          },
          {
            key: 'aiSettings',
            type: 'aiSettings',
            label: '',
            valueType: 'any',
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          },
          {
            key: 'systemPrompt',
            type: 'textarea',
            label: 'core.ai.Prompt',
            max: 300,
            valueType: 'string',
            description:
              '模型固定的引导词，通过调整该内容，可以引导模型聊天方向。该内容会被固定在上下文的开头。可使用变量，例如 {{language}}',
            placeholder:
              '模型固定的引导词，通过调整该内容，可以引导模型聊天方向。该内容会被固定在上下文的开头。可使用变量，例如 {{language}}',
            showTargetInApp: true,
            showTargetInPlugin: true,
            value: formData.aiSettings.systemPrompt,
            connected: false
          },
          {
            key: 'history',
            type: 'numberInput',
            label: 'core.module.input.label.chat history',
            required: true,
            min: 0,
            max: 30,
            valueType: 'chatHistory',
            value: 6,
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'quoteQA',
            type: 'target',
            label: '引用内容',
            description: "对象数组格式，结构：\n [{q:'问题',a:'回答'}]",
            valueType: 'datasetQuote',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'core.module.input.label.user question',
            required: true,
            valueType: 'string',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            label: 'AI回复',
            description: '将在 stream 回复完毕后触发',
            valueType: 'string',
            type: 'source',
            targets: []
          },
          {
            key: 'finish',
            label: 'core.module.output.label.running done',
            description: 'core.module.output.description.running done',
            valueType: 'boolean',
            type: 'source',
            targets: []
          },
          {
            key: 'history',
            label: '新的上下文',
            description: '将本次回复内容拼接上历史记录，作为新的上下文返回',
            valueType: 'chatHistory',
            type: 'source',
            targets: []
          }
        ]
      }
    ];
  }
  function toolTemplates(formData: AppSimpleEditFormType): ModuleItemType[] {
    const modules: ModuleItemType[] = [
      {
        moduleId: 'userChatInput',
        name: UserInputModule.name,
        intro: UserInputModule.intro,
        avatar: UserInputModule.avatar,
        flowType: UserInputModule.flowType,
        position: {
          x: 324.81436595478294,
          y: 1527.0012457753612
        },
        inputs: UserInputModule.inputs,
        outputs: [
          {
            ...UserInputModule.outputs[0],
            targets: [
              {
                moduleId: 'yt7o6j',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'yt7o6j',
        name: ToolModule.name,
        intro: ToolModule.intro,
        avatar: ToolModule.avatar,
        flowType: ToolModule.flowType,
        showStatus: ToolModule.showStatus,
        position: {
          x: 890.8756545707358,
          y: 1078.2777133587558
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'core.module.input.label.switch',
            description: 'core.module.input.description.Trigger',
            valueType: 'any',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'model',
            type: 'selectLLMModel',
            label: 'core.module.input.label.aiModel',
            required: true,
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            llmModelType: 'toolCall',
            value: formData.aiSettings.model,
            connected: false
          },
          {
            key: ModuleInputKeyEnum.aiChatTemperature,
            type: FlowNodeInputTypeEnum.hidden, // Set in the pop-up window
            label: '',
            value: formData.aiSettings.temperature,
            valueType: ModuleIOValueTypeEnum.number,
            min: 0,
            max: 10,
            step: 1,
            showTargetInApp: false,
            showTargetInPlugin: false
          },
          {
            key: ModuleInputKeyEnum.aiChatMaxToken,
            type: FlowNodeInputTypeEnum.hidden, // Set in the pop-up window
            label: '',
            value: formData.aiSettings.maxToken,
            valueType: ModuleIOValueTypeEnum.number,
            min: 100,
            max: 4000,
            step: 50,
            showTargetInApp: false,
            showTargetInPlugin: false
          },
          {
            key: 'systemPrompt',
            type: 'textarea',
            max: 3000,
            valueType: 'string',
            label: 'core.ai.Prompt',
            description: 'core.app.tip.chatNodeSystemPromptTip',
            placeholder: 'core.app.tip.chatNodeSystemPromptTip',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false,
            value: formData.aiSettings.systemPrompt
          },
          {
            key: 'history',
            type: 'numberInput',
            label: 'core.module.input.label.chat history',
            required: true,
            min: 0,
            max: 30,
            valueType: 'chatHistory',
            value: 6,
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'userChatInput',
            type: 'custom',
            label: '',
            required: true,
            valueType: 'string',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'core.module.input.label.user question',
            type: 'hidden',
            valueType: 'string',
            targets: []
          },
          {
            key: 'selectedTools',
            valueType: 'tools',
            type: 'hidden',
            targets: [
              {
                moduleId: '1wdydt',
                key: 'selectedTools'
              }
            ]
          },
          {
            key: 'finish',
            label: 'core.module.output.label.running done',
            description: 'core.module.output.description.running done',
            valueType: 'boolean',
            type: 'source',
            targets: []
          }
        ]
      },
      {
        moduleId: '1wdydt',
        name: DatasetSearchModule.name,
        intro: DatasetSearchModule.intro,
        avatar: DatasetSearchModule.avatar,
        flowType: DatasetSearchModule.flowType,
        showStatus: DatasetSearchModule.showStatus,
        position: {
          x: 1205.7246680803316,
          y: 2143.3348974694836
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'core.module.input.label.switch',
            description: 'core.module.input.description.Trigger',
            valueType: 'any',
            showTargetInApp: true,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'datasets',
            type: 'selectDataset',
            label: '关联的知识库',
            value: formData.dataset.datasets,
            valueType: 'selectDataset',
            required: true,
            showTargetInApp: false,
            showTargetInPlugin: true,
            connected: false
          },
          {
            key: 'similarity',
            type: 'selectDatasetParamsModal',
            label: '',
            value: formData.dataset.similarity,
            valueType: 'number',
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          },
          {
            key: 'limit',
            type: 'hidden',
            label: '',
            value: formData.dataset.limit,
            valueType: 'number',
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false
          },
          {
            key: 'searchMode',
            type: 'hidden',
            label: '',
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.dataset.searchMode,
            connected: false
          },
          {
            key: 'usingReRank',
            type: 'hidden',
            label: '',
            valueType: 'boolean',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.dataset.usingReRank,
            connected: false
          },
          {
            key: 'datasetSearchUsingExtensionQuery',
            type: 'hidden',
            label: '',
            valueType: 'boolean',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.dataset.datasetSearchUsingExtensionQuery,
            connected: false
          },
          {
            key: 'datasetSearchExtensionModel',
            type: 'hidden',
            label: '',
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            connected: false,
            value: formData.dataset.datasetSearchExtensionModel
          },
          {
            key: 'datasetSearchExtensionBg',
            type: 'hidden',
            label: '',
            valueType: 'string',
            showTargetInApp: false,
            showTargetInPlugin: false,
            value: formData.dataset.datasetSearchExtensionBg,
            connected: false
          },
          {
            key: 'userChatInput',
            type: 'custom',
            label: '',
            required: true,
            valueType: 'string',
            showTargetInApp: true,
            showTargetInPlugin: true,
            toolDescription: '需要检索的内容',
            connected: false
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'core.module.input.label.user question',
            type: 'hidden',
            valueType: 'string',
            targets: []
          },
          {
            key: 'isEmpty',
            label: 'core.module.output.label.Search result empty',
            type: 'source',
            valueType: 'boolean',
            targets: []
          },
          {
            key: 'unEmpty',
            label: 'core.module.output.label.Search result not empty',
            type: 'source',
            valueType: 'boolean',
            targets: []
          },
          {
            key: 'quoteQA',
            label: 'core.module.Dataset quote.label',
            type: 'source',
            valueType: 'datasetQuote',
            targets: []
          },
          {
            key: 'finish',
            label: 'core.module.output.label.running done',
            description: 'core.module.output.description.running done',
            valueType: 'boolean',
            type: 'source',
            targets: []
          }
        ]
      }
    ];

    return modules;
  }
  const modules = data.dataset.datasets.length > 0 ? toolTemplates(data) : simpleChatTemplate(data);

  return [...userGuideTemplate(data), ...modules];
}
