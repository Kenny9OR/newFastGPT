import type {
  ModuleDispatchProps,
  ModuleDispatchResponse
} from '@fastgpt/global/core/module/type.d';
import { dispatchModules } from '../index';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/module/node/constant';
import {
  DYNAMIC_INPUT_KEY,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  ModuleRunTimerOutputEnum
} from '@fastgpt/global/core/module/constants';
import { getPluginRuntimeById } from '@fastgpt/service/core/plugin/controller';
import { authPluginCanUse } from '@fastgpt/service/support/permission/auth/plugin';
import { setEntryEntries } from '../utils';

type RunPluginProps = ModuleDispatchProps<{
  [ModuleInputKeyEnum.pluginId]: string;
  [key: string]: any;
}>;
type RunPluginResponse = ModuleDispatchResponse<{}>;

export const dispatchRunPlugin = async (props: RunPluginProps): Promise<RunPluginResponse> => {
  const {
    mode,
    teamId,
    tmbId,
    module,
    params: { pluginId, ...data }
  } = props;

  if (!pluginId) {
    return Promise.reject('pluginId can not find');
  }

  await authPluginCanUse({ id: pluginId, teamId, tmbId });
  const plugin = await getPluginRuntimeById(pluginId);

  // concat dynamic inputs
  const inputModule = plugin.modules.find((item) => item.flowType === FlowNodeTypeEnum.pluginInput);
  if (!inputModule) return Promise.reject('Plugin error, It has no set input.');
  const hasDynamicInput = inputModule.inputs.find((input) => input.key === DYNAMIC_INPUT_KEY);

  const startParams: Record<string, any> = (() => {
    if (!hasDynamicInput) return data;

    const params: Record<string, any> = {
      [DYNAMIC_INPUT_KEY]: {}
    };

    for (const key in data) {
      const input = inputModule.inputs.find((input) => input.key === key);
      if (input) {
        params[key] = data[key];
      } else {
        params[DYNAMIC_INPUT_KEY][key] = data[key];
      }
    }

    return params;
  })();

  const { responseData, moduleDispatchBills, assistantResponse } = await dispatchModules({
    ...props,
    modules: setEntryEntries(plugin.modules).map((module) => ({
      ...module,
      showStatus: false
    })),
    runtimeModules: undefined, // must reset
    startParams
  });

  const output = responseData.find((item) => item.moduleType === FlowNodeTypeEnum.pluginOutput);

  if (output) {
    output.moduleLogo = plugin.avatar;
  }

  return {
    assistantResponse,
    // responseData, // debug
    [ModuleRunTimerOutputEnum.responseData]: {
      moduleLogo: plugin.avatar,
      totalPoints: responseData.reduce((sum, item) => sum + (item.totalPoints || 0), 0),
      pluginOutput: output?.pluginOutput,
      pluginDetail:
        mode === 'test' && plugin.teamId === teamId
          ? responseData.filter((item) => {
              const filterArr = [FlowNodeTypeEnum.pluginOutput];
              return !filterArr.includes(item.moduleType as any);
            })
          : undefined
    },
    [ModuleRunTimerOutputEnum.moduleDispatchBills]: [
      {
        moduleName: plugin.name,
        totalPoints: moduleDispatchBills.reduce((sum, item) => sum + (item.totalPoints || 0), 0),
        model: plugin.name,
        tokens: 0
      }
    ],
    [ModuleRunTimerOutputEnum.toolResponse]: output?.pluginOutput ? output.pluginOutput : {},
    ...(output ? output.pluginOutput : {})
  };
};
