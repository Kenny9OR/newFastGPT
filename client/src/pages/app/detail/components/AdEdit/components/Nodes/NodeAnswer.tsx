import React from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from '../modules/NodeCard';
import { FlowModuleItemType } from '@/types/flow';
import Container from '../modules/Container';
import RenderInput from '../render/RenderInput';

const NodeAnswer = ({ data }: NodeProps<FlowModuleItemType>) => {
  const { moduleId, inputs, outputs, onChangeNode } = data;
  return (
    <NodeCard minW={'400px'} {...data}>
      <Container borderTop={'2px solid'} borderTopColor={'myGray.200'}>
        <RenderInput moduleId={moduleId} onChangeNode={onChangeNode} flowInputList={inputs} />
      </Container>
    </NodeCard>
  );
};
export default React.memo(NodeAnswer);
