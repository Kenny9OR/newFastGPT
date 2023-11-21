import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowModuleTemplateType } from '../../type.d';
import { ModuleDataTypeEnum, ModuleInputKeyEnum, ModuleOutputKeyEnum } from '../../constants';
import {
  Input_Template_History,
  Input_Template_TFSwitch,
  Input_Template_UserChatInput
} from '../input';
import { Output_Template_Finish } from '../output';

export const RunAppModule: FlowModuleTemplateType = {
  id: FlowNodeTypeEnum.runApp,
  flowType: FlowNodeTypeEnum.runApp,
  logo: '/imgs/module/app.png',
  name: '应用调用',
  intro: '可以选择一个其他应用进行调用',
  description: '可以选择一个其他应用进行调用',
  showStatus: true,
  inputs: [
    Input_Template_TFSwitch,
    {
      key: ModuleInputKeyEnum.runAppSelectApp,
      type: FlowNodeInputTypeEnum.selectApp,
      label: '选择一个应用',
      description: '选择一个其他应用进行调用',
      required: true
    },
    Input_Template_History,
    Input_Template_UserChatInput
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.history,
      label: '新的上下文',
      description: '将该应用回复内容拼接到历史记录中，作为新的上下文返回',
      valueType: ModuleDataTypeEnum.chatHistory,
      type: FlowNodeOutputTypeEnum.source,
      targets: []
    },
    {
      key: ModuleOutputKeyEnum.answerText,
      label: 'AI回复',
      description: '将在应用完全结束后触发',
      valueType: ModuleDataTypeEnum.string,
      type: FlowNodeOutputTypeEnum.source,
      targets: []
    },
    Output_Template_Finish
  ]
};
