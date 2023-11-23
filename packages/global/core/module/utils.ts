import { FlowNodeInputTypeEnum, FlowNodeTypeEnum } from './node/constant';
import { ModuleDataTypeEnum, ModuleInputKeyEnum } from './constants';
import { FlowNodeInputItemType, FlowNodeOutputItemType } from './node/type';
import { AppTTSConfigType, ModuleItemType, VariableItemType } from './type';

export const getGuideModule = (modules: ModuleItemType[]) =>
  modules.find((item) => item.flowType === FlowNodeTypeEnum.userGuide);

export const splitGuideModule = (guideModules?: ModuleItemType) => {
  const welcomeText: string =
    guideModules?.inputs?.find((item) => item.key === ModuleInputKeyEnum.welcomeText)?.value || '';

  const variableModules: VariableItemType[] =
    guideModules?.inputs.find((item) => item.key === ModuleInputKeyEnum.variables)?.value || [];

  const questionGuide: boolean =
    !!guideModules?.inputs?.find((item) => item.key === ModuleInputKeyEnum.questionGuide)?.value ||
    false;

  const ttsConfig: AppTTSConfigType = guideModules?.inputs?.find(
    (item) => item.key === ModuleInputKeyEnum.tts
  )?.value || { type: 'web' };

  return {
    welcomeText,
    variableModules,
    questionGuide,
    ttsConfig
  };
};

export function getPluginTemplatePluginIdInput(pluginId: string): FlowNodeInputItemType {
  return {
    key: ModuleInputKeyEnum.pluginId,
    type: FlowNodeInputTypeEnum.hidden,
    label: 'pluginId',
    value: pluginId,
    valueType: ModuleDataTypeEnum.string,
    connected: true,
    showTargetInApp: false,
    showTargetInPlugin: false
  };
}

export function formatPluginIOModules(
  pluginId: string,
  modules: ModuleItemType[]
): {
  inputs: FlowNodeInputItemType[];
  outputs: FlowNodeOutputItemType[];
} {
  const pluginInput = modules.find((module) => module.flowType === FlowNodeTypeEnum.pluginInput);
  const customOutput = modules.find((module) => module.flowType === FlowNodeTypeEnum.pluginOutput);

  return {
    inputs: pluginInput
      ? [
          getPluginTemplatePluginIdInput(pluginId),
          ...pluginInput.inputs.map((item) => ({
            ...item,
            edit: false,
            connected: false
          }))
        ]
      : [],
    outputs: customOutput
      ? customOutput.outputs.map((item) => ({
          ...item,
          edit: false
        }))
      : []
  };
}
