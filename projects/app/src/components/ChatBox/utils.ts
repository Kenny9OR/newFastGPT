import { ChatItemValueItemType } from '@fastgpt/global/core/chat/type';
import { ChatBoxInputType, UserInputFileItemType } from './type';
import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import { getNanoid } from '@fastgpt/global/common/string/tools';

export const formatChatValue2InputType = (value: ChatItemValueItemType[]): ChatBoxInputType => {
  const text = value
    .filter((item) => item.text?.content)
    .map((item) => item.text?.content || '')
    .join('');
  const files =
    (value
      .map((item) =>
        item.type === ChatItemValueTypeEnum.file && item.file
          ? {
              id: getNanoid(),
              type: item.file.type,
              name: item.file.name,
              icon: '',
              url: item.file.url
            }
          : undefined
      )
      .filter(Boolean) as UserInputFileItemType[]) || [];

  return {
    text,
    files
  };
};
