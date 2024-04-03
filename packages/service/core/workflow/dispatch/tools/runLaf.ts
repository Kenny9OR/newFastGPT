import type { ModuleDispatchProps } from '@fastgpt/global/core/module/type.d';
import {
  DYNAMIC_INPUT_KEY,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum
} from '@fastgpt/global/core/module/constants';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';
import axios from 'axios';
import { valueTypeFormat } from '../utils';
import { SERVICE_LOCAL_HOST } from '../../../../common/system/tools';
import { addLog } from '../../../../common/system/log';
import { DispatchNodeResultType } from '@fastgpt/global/core/module/runtime/type';

type LafRequestProps = ModuleDispatchProps<{
  [ModuleInputKeyEnum.abandon_httpUrl]: string;
  [ModuleInputKeyEnum.httpMethod]: string;
  [ModuleInputKeyEnum.httpReqUrl]: string;
  [ModuleInputKeyEnum.httpJsonBody]: string;
  [DYNAMIC_INPUT_KEY]: Record<string, any>;
  [key: string]: any;
  toolModules: any;
}>;
type LafResponse = DispatchNodeResultType<{
  [ModuleOutputKeyEnum.failed]?: boolean;
  [key: string]: any;
}>;

const UNDEFINED_SIGN = 'UNDEFINED_SIGN';

export const dispatchLafRequest = async (props: LafRequestProps): Promise<LafResponse> => {
  let {
    appId,
    chatId,
    responseChatItemId,
    variables,
    module: { outputs },
    histories,
    params: {
      system_httpMethod: httpMethod = 'POST',
      system_httpReqUrl: httpReqUrl,
      system_httpJsonBody: httpJsonBody,
      [DYNAMIC_INPUT_KEY]: dynamicInput,
      ...body
    }
  } = props;

  if (!httpReqUrl) {
    return Promise.reject('Http url is empty');
  }

  const concatVariables = {
    appId,
    chatId,
    responseChatItemId,
    ...variables,
    histories: histories.slice(0, 10),
    ...body
  };

  httpReqUrl = replaceVariable(httpReqUrl, concatVariables);

  const requestBody = await (() => {
    if (!httpJsonBody) return { [DYNAMIC_INPUT_KEY]: dynamicInput };
    httpJsonBody = replaceVariable(httpJsonBody, concatVariables);
    try {
      const jsonParse = JSON.parse(httpJsonBody);
      const removeSignJson = removeUndefinedSign(jsonParse);
      return { [DYNAMIC_INPUT_KEY]: dynamicInput, ...removeSignJson };
    } catch (error) {
      console.log(error);
      return Promise.reject(`Invalid JSON body: ${httpJsonBody}`);
    }
  })();

  try {
    const { formatResponse, rawResponse } = await fetchData({
      method: httpMethod,
      url: httpReqUrl,
      body: requestBody
    });

    // format output value type
    const results: Record<string, any> = {};
    for (const key in formatResponse) {
      const output = outputs.find((item) => item.key === key);
      if (!output) continue;
      results[key] = valueTypeFormat(formatResponse[key], output.valueType);
    }

    return {
      assistantResponses: [],
      [DispatchNodeResponseKeyEnum.nodeResponse]: {
        totalPoints: 0,
        body: Object.keys(requestBody).length > 0 ? requestBody : undefined,
        httpResult: rawResponse
      },
      [DispatchNodeResponseKeyEnum.toolResponses]: rawResponse,
      [ModuleOutputKeyEnum.httpRawResponse]: rawResponse,
      ...results
    };
  } catch (error) {
    addLog.error('Http request error', error);
    return {
      [ModuleOutputKeyEnum.failed]: true,
      [DispatchNodeResponseKeyEnum.nodeResponse]: {
        totalPoints: 0,
        body: Object.keys(requestBody).length > 0 ? requestBody : undefined,
        httpResult: { error: formatHttpError(error) }
      }
    };
  }
};

async function fetchData({
  method,
  url,
  body
}: {
  method: string;
  url: string;
  body: Record<string, any>;
}): Promise<Record<string, any>> {
  const { data: response } = await axios({
    method,
    baseURL: `http://${SERVICE_LOCAL_HOST}`,
    url,
    headers: {
      'Content-Type': 'application/json'
    },
    data: body
  });

  const parseJson = (obj: Record<string, any>, prefix = '') => {
    let result: Record<string, any> = {};

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        result[`${prefix}[${i}]`] = obj[i];

        if (Array.isArray(obj[i])) {
          result = {
            ...result,
            ...parseJson(obj[i], `${prefix}[${i}]`)
          };
        } else if (typeof obj[i] === 'object') {
          result = {
            ...result,
            ...parseJson(obj[i], `${prefix}[${i}].`)
          };
        }
      }
    } else if (typeof obj == 'object') {
      for (const key in obj) {
        result[`${prefix}${key}`] = obj[key];

        if (Array.isArray(obj[key])) {
          result = {
            ...result,
            ...parseJson(obj[key], `${prefix}${key}`)
          };
        } else if (typeof obj[key] === 'object') {
          result = {
            ...result,
            ...parseJson(obj[key], `${prefix}${key}.`)
          };
        }
      }
    }

    return result;
  };

  return {
    formatResponse:
      typeof response === 'object' && !Array.isArray(response) ? parseJson(response) : {},
    rawResponse: response
  };
}

function replaceVariable(text: string, obj: Record<string, any>) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), UNDEFINED_SIGN);
    } else {
      const replacement = JSON.stringify(value);
      const unquotedReplacement =
        replacement.startsWith('"') && replacement.endsWith('"')
          ? replacement.slice(1, -1)
          : replacement;
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), unquotedReplacement);
    }
  }
  return text || '';
}
function removeUndefinedSign(obj: Record<string, any>) {
  for (const key in obj) {
    if (obj[key] === UNDEFINED_SIGN) {
      obj[key] = undefined;
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item: any) => {
        if (item === UNDEFINED_SIGN) {
          return undefined;
        } else if (typeof item === 'object') {
          removeUndefinedSign(item);
        }
        return item;
      });
    } else if (typeof obj[key] === 'object') {
      removeUndefinedSign(obj[key]);
    }
  }
  return obj;
}
function formatHttpError(error: any) {
  return {
    message: error?.message,
    name: error?.name,
    method: error?.config?.method,
    baseURL: error?.config?.baseURL,
    url: error?.config?.url,
    code: error?.code,
    status: error?.status
  };
}
