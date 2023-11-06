import { VectorModelItemType } from '../../model';
import type { DatasetSchemaType } from '@fastgpt/global/core/dataset/type.d';

export type DatasetItemType = Omit<DatasetSchemaType, 'vectorModel' | 'tags'> & {
  tags: string;
  vectorModel: VectorModelItemType;
  canWrite: boolean;
  isOwner: boolean;
};

export type DatasetPathItemType = {
  parentId: string;
  parentName: string;
};

export type SelectedDatasetType = { datasetId: string; vectorModel: VectorModelItemType }[];
