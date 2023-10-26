import React, { useCallback, useMemo } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import type {
  FlowModuleTemplateType,
  SystemModuleTemplateType
} from '@fastgpt/global/core/module/type.d';
import { useViewport, XYPosition } from 'reactflow';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import Avatar from '@/components/Avatar';
import { useFlowProviderStore } from './FlowProvider';
import { customAlphabet } from 'nanoid';
import { appModule2FlowNode } from '@/utils/adapt';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);
import MyIcon from '@/components/Icon';
import EmptyTip from '@/components/EmptyTip';
enum TemplateTypeEnum {
  system = 'system',
  combine = 'combine'
}

export type ModuleTemplateProps = {
  systemTemplates: SystemModuleTemplateType;
  combineTemplates: SystemModuleTemplateType;
  showCreateCombine?: boolean;
};

const ModuleTemplateList = ({
  systemTemplates,
  combineTemplates,
  showCreateCombine = false,
  isOpen,
  onClose
}: ModuleTemplateProps & {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [templateType, setTemplateType] = React.useState(TemplateTypeEnum.system);

  const typeList = useMemo(
    () => [
      {
        type: TemplateTypeEnum.system,
        label: t('app.module.System Module'),
        child: <RenderList templates={systemTemplates} onClose={onClose} />
      },
      {
        type: TemplateTypeEnum.combine,
        label: t('app.module.Combine Module'),
        child: <RenderList templates={combineTemplates} onClose={onClose} />
      }
    ],
    [combineTemplates, onClose, systemTemplates, t]
  );
  const TemplateItem = useMemo(
    () => typeList.find((item) => item.type === templateType)?.child,
    [templateType, typeList]
  );

  return (
    <>
      <Box
        zIndex={2}
        display={isOpen ? 'block' : 'none'}
        position={'absolute'}
        top={0}
        left={0}
        bottom={0}
        w={'360px'}
        onClick={onClose}
      />
      <Flex
        zIndex={3}
        flexDirection={'column'}
        position={'absolute'}
        top={'65px'}
        left={0}
        pb={4}
        h={isOpen ? 'calc(100% - 100px)' : '0'}
        w={isOpen ? ['100%', '360px'] : '0'}
        bg={'white'}
        boxShadow={'3px 0 20px rgba(0,0,0,0.2)'}
        borderRadius={'20px'}
        overflow={'hidden'}
        transition={'.2s ease'}
        userSelect={'none'}
      >
        <Flex pt={4} pb={1} px={5} gap={4} alignItems={'center'} fontSize={['md', 'xl']}>
          {typeList.map((item) => (
            <Box
              key={item.label}
              borderBottom={'2px solid transparent'}
              {...(item.type === templateType
                ? {
                    color: 'myBlue.700',
                    borderBottomColor: 'myBlue.700',
                    fontWeight: 'bold'
                  }
                : {
                    cursor: 'pointer',
                    onClick: () => setTemplateType(item.type)
                  })}
            >
              {item.label}
            </Box>
          ))}
          <Box flex={1} />
          {showCreateCombine && templateType === TemplateTypeEnum.combine && (
            <Flex
              alignItems={'center'}
              _hover={{ textDecoration: 'underline' }}
              cursor={'pointer'}
              onClick={() => router.push('/app/module/edit')}
            >
              <Box fontSize={'sm'} transform={'translateY(-1px)'}>
                去创建
              </Box>
              <MyIcon name={'rightArrowLight'} w={'12px'} />
            </Flex>
          )}
        </Flex>
        {TemplateItem}
      </Flex>
    </>
  );
};

export default React.memo(ModuleTemplateList);

var RenderList = React.memo(function RenderList({
  templates,
  onClose
}: {
  templates: {
    label: string;
    list: FlowModuleTemplateType[];
  }[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { isPc } = useSystemStore();
  const { setNodes, reactFlowWrapper } = useFlowProviderStore();
  const { x, y, zoom } = useViewport();

  const onAddNode = useCallback(
    ({ template, position }: { template: FlowModuleTemplateType; position: XYPosition }) => {
      if (!reactFlowWrapper?.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const mouseX = (position.x - reactFlowBounds.left - x) / zoom - 100;
      const mouseY = (position.y - reactFlowBounds.top - y) / zoom;
      setNodes((state) =>
        state.concat(
          appModule2FlowNode({
            item: {
              ...template,
              moduleId: nanoid(),
              position: { x: mouseX, y: mouseY - 20 }
            }
          })
        )
      );
    },
    [reactFlowWrapper, setNodes, x, y, zoom]
  );

  return templates.length === 0 ? (
    <EmptyTip text={t('app.module.No Modules')} />
  ) : (
    <Box flex={'1 0 0'} overflow={'overlay'}>
      <Box w={['100%', '330px']} mx={'auto'}>
        {templates.map((item) =>
          item.list.map((item) => (
            <Flex
              key={item.flowType}
              alignItems={'center'}
              p={5}
              cursor={'pointer'}
              _hover={{ bg: 'myWhite.600' }}
              borderRadius={'md'}
              draggable
              onDragEnd={(e) => {
                if (e.clientX < 360) return;
                onAddNode({
                  template: item,
                  position: { x: e.clientX, y: e.clientY }
                });
              }}
              onClick={(e) => {
                if (isPc) return;
                onClose();
                onAddNode({
                  template: item,
                  position: { x: e.clientX, y: e.clientY }
                });
              }}
            >
              <Avatar src={item.logo} w={'34px'} objectFit={'contain'} borderRadius={'0'} />
              <Box ml={5} flex={'1 0 0'}>
                <Box color={'black'}>{item.name}</Box>
                <Box className="textEllipsis3" color={'myGray.500'} fontSize={'sm'}>
                  {item.intro}
                </Box>
              </Box>
            </Flex>
          ))
        )}
      </Box>
    </Box>
  );
});
