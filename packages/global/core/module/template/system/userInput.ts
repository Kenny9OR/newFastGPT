import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowModuleTemplateType } from '../../type.d';
import { ModuleDataTypeEnum, ModuleInputKeyEnum, ModuleOutputKeyEnum } from '../../constants';

export const UserInputModule: FlowModuleTemplateType = {
  id: FlowNodeTypeEnum.questionInput,
  flowType: FlowNodeTypeEnum.questionInput,
  logo: '/imgs/module/userChatInput.png',
  name: '用户问题(对话入口)',
  intro: '用户输入的内容。该模块通常作为应用的入口，用户在发送消息后会首先执行该模块。',
  inputs: [
    {
      key: ModuleInputKeyEnum.userChatInput,
      type: FlowNodeInputTypeEnum.systemInput,
      label: '用户问题'
    }
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.userChatInput,
      label: '用户问题',
      type: FlowNodeOutputTypeEnum.source,
      valueType: ModuleDataTypeEnum.string,
      targets: []
    }
  ]
};
