import React, { useTransition } from 'react';
import type { RenderInputProps } from '../type';
import { onChangeNode } from '../../../../FlowProvider';
import { useTranslation } from 'next-i18next';
import MyTextarea from '@/components/common/Textarea/MyTextarea';

const TextareaRender = ({ item, moduleId }: RenderInputProps) => {
  const { t } = useTranslation();
  const [, startTst] = useTransition();

  const update = (value: string) => {
    onChangeNode({
      moduleId,
      type: 'updateInput',
      key: item.key,
      value: {
        ...item,
        value
      }
    });
  };

  return (
    <MyTextarea
      title={t(item.label)}
      rows={5}
      bg={'myWhite.400'}
      placeholder={t(item.placeholder || '')}
      resize={'both'}
      defaultValue={item.value}
      onChange={(e) => {
        startTst(() => {
          update(e.target.value);
        });
      }}
    />
  );
};

export default React.memo(TextareaRender);
