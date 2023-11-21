import React, { useCallback, useMemo, useState } from 'react';
import { NodeProps } from 'reactflow';
import {
  Box,
  Flex,
  Textarea,
  useTheme,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch
} from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { FlowModuleItemType, ModuleItemType } from '@fastgpt/global/core/module/type.d';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import { welcomeTextTip, variableTip } from '@fastgpt/global/core/module/template/tip';
import { onChangeNode } from '../../FlowProvider';

import VariableEditModal, { addVariable } from '../../../VariableEditModal';
import MyIcon from '@/components/Icon';
import MyTooltip from '@/components/MyTooltip';
import Container from '../modules/Container';
import NodeCard from '../modules/NodeCard';
import type { VariableItemType } from '@fastgpt/global/core/module/type.d';
import QGSwitch from '@/pages/app/detail/components/QGSwitch';
import TTSSelect from '@/pages/app/detail/components/TTSSelect';
import { splitGuideModule } from '@fastgpt/global/core/module/utils';

const NodeUserGuide = ({ data }: NodeProps<FlowModuleItemType>) => {
  const theme = useTheme();
  return (
    <>
      <NodeCard minW={'300px'} {...data}>
        <Container className="nodrag" borderTop={'2px solid'} borderTopColor={'myGray.200'}>
          <WelcomeText data={data} />
          <Box pt={4} pb={2}>
            <ChatStartVariable data={data} />
          </Box>
          <Box pt={3} borderTop={theme.borders.base}>
            <TTSGuide data={data} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <QuestionGuide data={data} />
          </Box>
        </Container>
      </NodeCard>
    </>
  );
};
export default React.memo(NodeUserGuide);

export function WelcomeText({ data }: { data: FlowModuleItemType }) {
  const { inputs, moduleId } = data;

  const welcomeText = useMemo(
    () => inputs.find((item) => item.key === ModuleInputKeyEnum.welcomeText),
    [inputs]
  );

  return (
    <>
      <Flex mb={1} alignItems={'center'}>
        <MyIcon name={'welcomeText'} mr={2} w={'16px'} color={'#E74694'} />
        <Box>开场白</Box>
        <MyTooltip label={welcomeTextTip} forceShow>
          <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
        </MyTooltip>
      </Flex>
      {welcomeText && (
        <Textarea
          className="nodrag"
          rows={6}
          resize={'both'}
          defaultValue={welcomeText.value}
          bg={'myWhite.500'}
          placeholder={welcomeTextTip}
          onChange={(e) => {
            onChangeNode({
              moduleId,
              key: ModuleInputKeyEnum.welcomeText,
              type: 'updateInput',
              value: {
                ...welcomeText,
                value: e.target.value
              }
            });
          }}
        />
      )}
    </>
  );
}

function ChatStartVariable({ data }: { data: FlowModuleItemType }) {
  const { inputs, moduleId } = data;

  const variables = useMemo(
    () =>
      (inputs.find((item) => item.key === ModuleInputKeyEnum.variables)
        ?.value as VariableItemType[]) || [],
    [inputs]
  );

  const [editVariable, setEditVariable] = useState<VariableItemType>();

  const updateVariables = useCallback(
    (value: VariableItemType[]) => {
      onChangeNode({
        moduleId,
        key: ModuleInputKeyEnum.variables,
        type: 'updateInput',
        value: {
          ...inputs.find((item) => item.key === ModuleInputKeyEnum.variables),
          value
        }
      });
    },
    [inputs, moduleId]
  );

  const onclickSubmit = useCallback(
    ({ variable }: { variable: VariableItemType }) => {
      updateVariables(variables.map((item) => (item.id === variable.id ? variable : item)));
      setEditVariable(undefined);
    },
    [updateVariables, variables]
  );

  return (
    <>
      <Flex mb={1} alignItems={'center'}>
        <MyIcon name={'variable'} mr={2} w={'16px'} color={'#fb7c3d'} />
        <Box>对话框变量</Box>
        <MyTooltip label={variableTip} forceShow>
          <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
        </MyTooltip>
        <Box flex={1} />
        <Flex
          ml={2}
          textAlign={'right'}
          cursor={'pointer'}
          px={3}
          py={'2px'}
          borderRadius={'md'}
          _hover={{ bg: 'myGray.200' }}
          onClick={() => {
            const newVariable = addVariable();
            updateVariables(variables.concat(newVariable));
            setEditVariable(newVariable);
          }}
        >
          +&ensp;新增
        </Flex>
      </Flex>
      {variables.length > 0 && (
        <TableContainer borderWidth={'1px'} borderBottom="none" borderRadius={'lg'}>
          <Table>
            <Thead>
              <Tr>
                <Th>变量名</Th>
                <Th>变量 key</Th>
                <Th>必填</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {variables.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.label} </Td>
                  <Td>{item.key}</Td>
                  <Td>{item.required ? '✔' : ''}</Td>
                  <Td>
                    <MyIcon
                      mr={3}
                      name={'settingLight'}
                      w={'16px'}
                      cursor={'pointer'}
                      onClick={() => {
                        setEditVariable(item);
                      }}
                    />
                    <MyIcon
                      name={'delete'}
                      w={'16px'}
                      cursor={'pointer'}
                      onClick={() =>
                        updateVariables(variables.filter((variable) => variable.id !== item.id))
                      }
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {!!editVariable && (
        <VariableEditModal
          defaultVariable={editVariable}
          onClose={() => setEditVariable(undefined)}
          onSubmit={onclickSubmit}
        />
      )}
    </>
  );
}

function QuestionGuide({ data }: { data: FlowModuleItemType }) {
  const { inputs, moduleId } = data;

  const questionGuide = useMemo(
    () =>
      (inputs.find((item) => item.key === ModuleInputKeyEnum.questionGuide)?.value as boolean) ||
      false,
    [inputs]
  );

  return (
    <QGSwitch
      isChecked={questionGuide}
      size={'lg'}
      onChange={(e) => {
        const value = e.target.checked;
        onChangeNode({
          moduleId,
          key: ModuleInputKeyEnum.questionGuide,
          type: 'updateInput',
          value: {
            ...inputs.find((item) => item.key === ModuleInputKeyEnum.questionGuide),
            value
          }
        });
      }}
    />
  );
}

function TTSGuide({ data }: { data: FlowModuleItemType }) {
  const { inputs, moduleId } = data;
  const { ttsConfig } = splitGuideModule({ inputs } as ModuleItemType);

  return (
    <TTSSelect
      value={ttsConfig}
      onChange={(e) => {
        onChangeNode({
          moduleId,
          key: ModuleInputKeyEnum.tts,
          type: 'updateInput',
          value: {
            ...inputs.find((item) => item.key === ModuleInputKeyEnum.tts),
            value: e
          }
        });
      }}
    />
  );
}
