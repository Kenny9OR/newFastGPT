import { FlowNodeInputTypeEnum, FlowNodeTypeEnum } from '../../node/constant';
import { FlowModuleTemplateType } from '../../type.d';
import { ModuleInputKeyEnum } from '../../constants';
import { Input_Template_TFSwitch } from '../input';
import { Output_Template_Finish } from '../output';

export const HttpModule: FlowModuleTemplateType = {
  id: FlowNodeTypeEnum.httpRequest,
  flowType: FlowNodeTypeEnum.httpRequest,
  logo: '/imgs/module/http.png',
  name: 'HTTP模块',
  intro: '可以发出一个 HTTP POST 请求，实现更为复杂的操作（联网搜索、数据库查询等）',
  description: '可以发出一个 HTTP POST 请求，实现更为复杂的操作（联网搜索、数据库查询等）',
  showStatus: true,
  inputs: [
    Input_Template_TFSwitch,
    {
      key: ModuleInputKeyEnum.httpUrl,
      value: '',
      type: FlowNodeInputTypeEnum.input,
      label: '请求地址',
      description: '请求目标地址',
      placeholder: 'https://api.fastgpt.run/getInventory',
      required: true,
      valueCheck: (val) => !!val
    }
  ],
  outputs: [Output_Template_Finish]
};
