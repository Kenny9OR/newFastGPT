import React, { useMemo } from 'react';
import { AppSchema } from '@/types/mongoSchema';

import Header from './Header';
import Flow from '@/components/core/module/Flow';
import FlowProvider, { useFlowProviderStore } from '@/components/core/module/Flow/FlowProvider';
import { SystemModuleTemplateType } from '@fastgpt/global/core/module/type.d';
import { SystemModuleTemplates } from '@/constants/flow/ModuleTemplate';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/module/node/constant';

type Props = { app: AppSchema; onClose: () => void };

const Render = ({ app, onClose }: Props) => {
  const { nodes } = useFlowProviderStore();

  const filterTemplates = useMemo(() => {
    const copyTemplates: SystemModuleTemplateType = JSON.parse(
      JSON.stringify(SystemModuleTemplates)
    );
    const filterType: Record<string, 1> = {
      [FlowNodeTypeEnum.userGuide]: 1
    };
    // filter some template
    nodes.forEach((node) => {
      if (node.type && filterType[node.type]) {
        copyTemplates.forEach((item) => {
          item.list.forEach((module, index) => {
            if (module.flowType === node.type) {
              item.list.splice(index, 1);
            }
          });
        });
      }
    });

    return copyTemplates;
  }, [nodes]);

  return (
    <Flow
      systemTemplates={filterTemplates}
      combineTemplates={[]}
      showCreateCombine
      modules={app.modules}
      Header={<Header app={app} onClose={onClose} />}
    />
  );
};

export default React.memo(function AdEdit(props: Props) {
  return (
    <FlowProvider filterAppIds={[props.app._id]}>
      <Render {...props} />
    </FlowProvider>
  );
});
