import { PgClient } from '@/service/pg';
import type { moduleDispatchResType } from '@/types/chat';
import { TaskResponseKeyEnum } from '@/constants/chat';
import { getVectorsByText } from '@/service/core/ai/vector';
import { countModelPrice } from '@/service/support/wallet/bill/push';
import type { SelectedDatasetType } from '@/types/core/dataset';
import type {
  SearchDataResponseItemType,
  SearchDataResultItemType
} from '@fastgpt/global/core/dataset/type';
import { PgDatasetTableName } from '@/constants/plugin';
import type { ModuleDispatchProps } from '@/types/core/chat/type';
import { ModelTypeEnum } from '@/service/core/ai/model';
import { getPgDataWithCollection } from '@/service/core/dataset/data/controller';

type DatasetSearchProps = ModuleDispatchProps<{
  datasets: SelectedDatasetType;
  similarity: number;
  limit: number;
  userChatInput: string;
}>;
export type KBSearchResponse = {
  [TaskResponseKeyEnum.responseData]: moduleDispatchResType;
  isEmpty?: boolean;
  unEmpty?: boolean;
  quoteQA: SearchDataResponseItemType[];
};

export async function dispatchDatasetSearch(props: Record<string, any>): Promise<KBSearchResponse> {
  const {
    teamId,
    tmbId,
    user,
    inputs: { datasets = [], similarity = 0.4, limit = 5, userChatInput }
  } = props as DatasetSearchProps;

  if (datasets.length === 0) {
    return Promise.reject("You didn't choose the knowledge base");
  }

  if (!userChatInput) {
    return Promise.reject('Your input is empty');
  }

  // get vector
  const vectorModel = datasets[0]?.vectorModel || global.vectorModels[0];

  const { vectors, tokenLen } = await getVectorsByText({
    model: vectorModel.model,
    input: [userChatInput]
  });

  // search kb
  const results: any = await PgClient.query(
    `BEGIN;
    SET LOCAL hnsw.ef_search = ${global.systemEnv.pgHNSWEfSearch || 100};
    select id, q, a, dataset_id, collection_id, (vector <#> '[${
      vectors[0]
    }]') * -1 AS score from ${PgDatasetTableName} where user_id='${
      user._id
    }' AND dataset_id IN (${datasets
      .map((item) => `'${item.datasetId}'`)
      .join(',')}) AND vector <#> '[${vectors[0]}]' < -${similarity} order by vector <#> '[${
      vectors[0]
    }]' limit ${limit};
    COMMIT;`
  );

  const rows = results?.[2]?.rows as SearchDataResultItemType[];
  const collectionsData = await getPgDataWithCollection({ pgDataList: rows });
  const searchRes: SearchDataResponseItemType[] = collectionsData.map((item, index) => ({
    ...item,
    score: rows[index].score
  }));

  return {
    isEmpty: searchRes.length === 0 ? true : undefined,
    unEmpty: searchRes.length > 0 ? true : undefined,
    quoteQA: searchRes,
    responseData: {
      price: countModelPrice({
        model: vectorModel.model,
        tokens: tokenLen,
        type: ModelTypeEnum.vector
      }),
      model: vectorModel.name,
      tokens: tokenLen,
      similarity,
      limit
    }
  };
}
