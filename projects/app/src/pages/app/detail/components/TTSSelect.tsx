import MyIcon from '@/components/Icon';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MySelect from '@/components/Select';
import { TTSTypeEnum } from '@/constants/app';
import { Text2SpeechVoiceEnum, openaiTTSModel } from '@fastgpt/global/core/ai/speech/constant';
import { AppTTSConfigType } from '@/types/app';

const TTSSelect = ({
  value,
  onChange
}: {
  value: AppTTSConfigType;
  onChange: (e: AppTTSConfigType) => void;
}) => {
  const { t } = useTranslation();

  const formatValue = useMemo(() => {
    if (!value || !value.type) {
      return TTSTypeEnum.none;
    }
    if (value.type === TTSTypeEnum.none || value.type === TTSTypeEnum.web) {
      return value.type;
    }
    return value.voice;
  }, [value]);

  const onclickChange = useCallback(
    (e: string) => {
      if (e === TTSTypeEnum.none || e === TTSTypeEnum.web) {
        onChange({ type: e as `${TTSTypeEnum}` });
      } else {
        onChange({
          type: TTSTypeEnum.model,
          model: openaiTTSModel,
          voice: e as `${Text2SpeechVoiceEnum}`,
          speed: 1.2
        });
      }
    },
    [onChange]
  );

  return (
    <Flex alignItems={'center'}>
      <MyIcon name={'core/app/ttsFill'} mr={2} w={'16px'} />
      <Box>{t('core.app.TTS')}</Box>
      <MyTooltip label={t('core.app.TTS Tip')} forceShow>
        <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
      </MyTooltip>
      <Box flex={1} />
      <MySelect
        w={'150px'}
        value={formatValue}
        list={[
          { label: t('core.app.tts.Close'), value: TTSTypeEnum.none },
          { label: t('core.app.tts.Web'), value: TTSTypeEnum.web },
          { label: 'Alloy', value: Text2SpeechVoiceEnum.alloy },
          { label: 'Echo', value: Text2SpeechVoiceEnum.echo },
          { label: 'Fable', value: Text2SpeechVoiceEnum.fable },
          { label: 'Onyx', value: Text2SpeechVoiceEnum.onyx },
          { label: 'Nova', value: Text2SpeechVoiceEnum.nova },
          { label: 'Shimmer', value: Text2SpeechVoiceEnum.shimmer }
        ]}
        onchange={onclickChange}
      />
    </Flex>
  );
};

export default TTSSelect;
