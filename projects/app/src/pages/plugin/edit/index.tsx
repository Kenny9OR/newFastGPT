import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Flow from '@/components/core/module/Flow';
import FlowProvider, { useFlowProviderStore } from '@/components/core/module/Flow/FlowProvider';
import { FlowModuleTemplateType } from '@fastgpt/global/core/module/type.d';
import { pluginModuleTemplates } from '@/web/core/modules/template/system';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/module/node/constant';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useQuery } from '@tanstack/react-query';
import { getOnePlugin } from '@/web/core/plugin/api';
import { useToast } from '@/web/common/hooks/useToast';
import Loading from '@/components/Loading';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useTranslation } from 'next-i18next';
import { usePluginStore } from '@/web/core/plugin/store/plugin';

type Props = { pluginId: string };

const Render = ({ pluginId }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { nodes = [] } = useFlowProviderStore();
  const { pluginModuleTemplates, loadPluginTemplates } = usePluginStore();

  const filterTemplates = useMemo(() => {
    const copyTemplates: FlowModuleTemplateType[] = JSON.parse(
      JSON.stringify(pluginModuleTemplates)
    );
    const filterType: Record<string, 1> = {
      [FlowNodeTypeEnum.userGuide]: 1,
      [FlowNodeTypeEnum.pluginInput]: 1,
      [FlowNodeTypeEnum.pluginOutput]: 1
    };

    // filter some template
    nodes.forEach((node) => {
      if (node.type && filterType[node.type]) {
        copyTemplates.forEach((module, index) => {
          if (module.flowType === node.type) {
            copyTemplates.splice(index, 1);
          }
        });
      }
    });

    return copyTemplates;
  }, [nodes]);

  const { data } = useQuery(['getOnePlugin', pluginId], () => getOnePlugin(pluginId), {
    onError: (error) => {
      toast({
        status: 'warning',
        title: getErrText(error, t('plugin.Load Plugin Failed'))
      });
      router.replace('/plugin/list');
    }
  });

  useQuery(['getPlugTemplates'], () => loadPluginTemplates());
  const filterPlugins = useMemo(() => {
    return pluginModuleTemplates.filter((item) => item.id !== pluginId);
  }, [pluginId, pluginModuleTemplates]);

  return data ? (
    <Flow
      systemTemplates={filterTemplates}
      pluginTemplates={filterPlugins}
      modules={data?.modules || []}
      Header={<Header plugin={data} onClose={() => router.back()} />}
    />
  ) : (
    <Loading />
  );
};

export default function AdEdit(props: any) {
  return (
    <FlowProvider mode={'plugin'} filterAppIds={[]}>
      <Render {...props} />
    </FlowProvider>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      pluginId: context?.query?.pluginId || '',
      ...(await serviceSideProps(context))
    }
  };
}
