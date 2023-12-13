import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowModuleTemplateType } from '../../type';
import {
  ModuleDataTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  ModuleTemplateTypeEnum
} from '../../constants';
import { Input_Template_TFSwitch } from '../input';

export const TextEditorModule: FlowModuleTemplateType = {
  id: FlowNodeTypeEnum.textEditor,
  templateType: ModuleTemplateTypeEnum.tools,
  flowType: FlowNodeTypeEnum.textEditor,
  avatar: '/imgs/module/textEditor.svg',
  name: 'core.module.template.textEditor',
  intro: 'core.module.template.textEditor intro',
  showStatus: false,
  inputs: [
    Input_Template_TFSwitch,
    {
      key: ModuleInputKeyEnum.textEditorInput,
      type: FlowNodeInputTypeEnum.custom,
      valueType: ModuleDataTypeEnum.string,
      label: 'core.module.input.label.textEditor textarea',
      description: 'core.module.input.description.textEditor textarea',
      placeholder: 'core.module.input.description.textEditor textarea',
      required: false,
      showTargetInApp: true,
      showTargetInPlugin: true
    }
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.text,
      label: 'core.module.output.label.text',
      valueType: ModuleDataTypeEnum.string,
      type: FlowNodeOutputTypeEnum.source,
      targets: []
    }
  ]
};
