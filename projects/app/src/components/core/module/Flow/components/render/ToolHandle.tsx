import MyTooltip from '@/components/MyTooltip';
import { FlowValueTypeMap } from '@/web/core/modules/constants/dataType';
import { Box, BoxProps } from '@chakra-ui/react';
import { ModuleIOValueTypeEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/module/constants';
import { useTranslation } from 'next-i18next';
import { Handle, Position } from 'reactflow';

type ToolHandleProps = BoxProps & {};
export const ToolTargetHandle = ({ ...props }: ToolHandleProps) => {
  const { t } = useTranslation();

  const valueTypeMap = FlowValueTypeMap[ModuleIOValueTypeEnum.tools];

  return (
    <Box position={'absolute'} top={'-5px'} left={'50%'} {...props}>
      <MyTooltip
        label={t('app.module.type', {
          type: t(valueTypeMap?.label),
          description: valueTypeMap?.description
        })}
      >
        <Handle
          style={{
            width: '14px',
            height: '14px',
            border: '4px solid #5E8FFF',
            borderRadius: '0',
            backgroundColor: 'transparent',
            transformOrigin: 'center',
            transform: 'translate(-100%,2px) rotate(45deg)'
          }}
          type="target"
          id={ModuleOutputKeyEnum.selectedTools}
          position={Position.Top}
        />
      </MyTooltip>
    </Box>
  );
};

export const ToolSourceHandle = ({ ...props }: ToolHandleProps) => {
  const { t } = useTranslation();

  const valueTypeMap = FlowValueTypeMap[ModuleIOValueTypeEnum.tools];

  return (
    <Box position={'absolute'} bottom={'-5px'} left={'50%'} {...props}>
      <MyTooltip
        label={t('app.module.type', {
          type: t(valueTypeMap?.label),
          description: valueTypeMap?.description
        })}
      >
        <Handle
          style={{
            width: '14px',
            height: '14px',
            border: '4px solid #5E8FFF',
            borderRadius: '0',
            backgroundColor: 'transparent',
            transformOrigin: 'center',
            transform: 'translate(-100%,2px) rotate(45deg)'
          }}
          type="source"
          id={ModuleOutputKeyEnum.selectedTools}
          position={Position.Bottom}
        />
      </MyTooltip>
    </Box>
  );
};
