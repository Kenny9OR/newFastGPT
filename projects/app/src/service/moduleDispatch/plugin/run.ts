import type { ModuleDispatchProps } from '@/types/core/chat/type';
import { dispatchModules } from '@/pages/api/v1/chat/completions';
import {
  FlowNodeSpecialInputKeyEnum,
  FlowNodeTypeEnum
} from '@fastgpt/global/core/module/node/constant';
import { getOnePluginDetail } from '@fastgpt/service/core/plugin/controller';
import { TaskResponseKeyEnum } from '@/constants/chat';
import { moduleDispatchResType } from '@/types/chat';

type RunPluginProps = ModuleDispatchProps<{
  [FlowNodeSpecialInputKeyEnum.pluginId]: string;
  [key: string]: any;
}>;
type RunPluginResponse = {
  [TaskResponseKeyEnum.responseData]: moduleDispatchResType[];
};

export const dispatchRunPlugin = async (props: RunPluginProps): Promise<RunPluginResponse> => {
  const {
    res,
    variables,
    user,
    stream,
    detail,
    inputs: { pluginId, ...data }
  } = props;

  if (!pluginId) {
    return Promise.reject('Input is empty');
  }

  const plugin = await getOnePluginDetail({ id: pluginId, userId: user._id });
  if (!plugin) {
    return Promise.reject('Plugin not found');
  }

  const { responseData } = await dispatchModules({
    res,
    modules: plugin.modules,
    user,
    variables,
    params: data,
    stream,
    detail
  });

  const outputVal =
    responseData.find((item) => item.moduleType === FlowNodeTypeEnum.pluginOutput)?.pluginOutput ||
    {};

  return {
    [TaskResponseKeyEnum.responseData]: responseData.filter(
      (item) => item.moduleType !== FlowNodeTypeEnum.pluginOutput
    ),
    ...outputVal
  };
};
