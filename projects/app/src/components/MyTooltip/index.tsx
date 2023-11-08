import React from 'react';
import { Box, Tooltip, TooltipProps } from '@chakra-ui/react';
import { useSystemStore } from '@/web/common/system/useSystemStore';

interface Props extends TooltipProps {
  forceShow?: boolean;
}

const MyTooltip = ({ children, forceShow = false, shouldWrapChildren = true, ...props }: Props) => {
  const { isPc } = useSystemStore();
  return isPc || forceShow ? (
    <Box
      display={'inline-flex'}
      alignItems={'center'}
      css={{
        '& span': {
          lineHeight: 1
        }
      }}
    >
      <Tooltip
        bg={'white'}
        arrowShadowColor={' rgba(0,0,0,0.05)'}
        hasArrow
        arrowSize={12}
        offset={[-15, 15]}
        color={'myGray.800'}
        px={4}
        py={2}
        borderRadius={'8px'}
        whiteSpace={'pre-wrap'}
        boxShadow={'1px 1px 10px rgba(0,0,0,0.2)'}
        shouldWrapChildren={shouldWrapChildren}
        {...props}
      >
        {children}
      </Tooltip>
    </Box>
  ) : (
    <>{children}</>
  );
};

export default MyTooltip;
