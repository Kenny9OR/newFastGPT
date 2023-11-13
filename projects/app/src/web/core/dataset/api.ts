import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import type { ParentTreePathItemType } from '@fastgpt/global/common/parentFolder/type.d';
import type { DatasetItemType } from '@fastgpt/global/core/dataset/type.d';
import type {
  DatasetUpdateParams,
  SearchTestProps,
  GetDatasetCollectionsProps,
  GetDatasetDataListProps,
  CreateDatasetCollectionParams,
  UpdateDatasetCollectionParams
} from '@/global/core/api/datasetReq.d';
import type {
  PushDatasetDataProps,
  UpdateDatasetDataProps,
  CreateDatasetParams,
  InsertOneDatasetDataProps
} from '@/global/core/dataset/api.d';
import type { PushDataResponse } from '@/global/core/api/datasetRes.d';
import type {
  DatasetCollectionItemType,
  SearchDataResponseItemType
} from '@fastgpt/global/core/dataset/type';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constant';
import { getToken } from '@/web/support/user/auth';
import download from 'downloadjs';
import type { DatasetDataItemType } from '@fastgpt/global/core/dataset/type';
import type { DatasetCollectionsListItemType } from '@/global/core/dataset/type.d';
import { PagingData } from '@/types';

/* ======================== dataset ======================= */
export const getDatasets = (data: { parentId?: string; type?: `${DatasetTypeEnum}` }) =>
  GET<DatasetItemType[]>(`/core/dataset/list`, data);

/**
 * get type=dataset list
 */
export const getAllDataset = () => GET<DatasetItemType[]>(`/core/dataset/allDataset`);

export const getDatasetPaths = (parentId?: string) =>
  GET<ParentTreePathItemType[]>('/core/dataset/paths', { parentId });

export const getDatasetById = (id: string) => GET<DatasetItemType>(`/core/dataset/detail?id=${id}`);

export const postCreateDataset = (data: CreateDatasetParams) =>
  POST<string>(`/core/dataset/create`, data);

export const putDatasetById = (data: DatasetUpdateParams) => PUT(`/core/dataset/update`, data);

export const delDatasetById = (id: string) => DELETE(`/core/dataset/delete?id=${id}`);

/* =========== search test ============ */
export const postSearchText = (data: SearchTestProps) =>
  POST<SearchDataResponseItemType[]>(`/core/dataset/searchTest`, data);

/* ============================= collections ==================================== */
export const getDatasetCollections = (data: GetDatasetCollectionsProps) =>
  POST<PagingData<DatasetCollectionsListItemType>>(`/core/dataset/collection/list`, data);
export const getDatasetCollectionPathById = (parentId: string) =>
  GET<ParentTreePathItemType[]>(`/core/dataset/collection/paths`, { parentId });
export const getDatasetCollectionById = (id: string) =>
  GET<DatasetCollectionItemType>(`/core/dataset/collection/detail`, { id });
export const postDatasetCollection = (data: CreateDatasetCollectionParams) =>
  POST<string>(`/core/dataset/collection/create`, data);
export const putDatasetCollectionById = (data: UpdateDatasetCollectionParams) =>
  POST(`/core/dataset/collection/update`, data);
export const delDatasetCollectionById = (params: { collectionId: string }) =>
  DELETE(`/core/dataset/collection/delById`, params);

/* =============================== data ==================================== */
/* get dataset list */
export const getDatasetDataList = (data: GetDatasetDataListProps) =>
  POST(`/core/dataset/data/list`, data);

/**
 * export and download data
 */
export const exportDatasetData = (data: { datasetId: string }) =>
  fetch(`/api/core/dataset/exportAll?datasetId=${data.datasetId}`, {
    method: 'GET',
    headers: {
      token: getToken()
    }
  })
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Export failed');
      }
      return res.blob();
    })
    .then((blob) => download(blob, 'dataset.csv', 'text/csv;charset=utf-8;'));

export const getDatasetDataItemById = (dataId: string) =>
  GET<DatasetDataItemType>(`/core/dataset/data/detail`, { dataId });

/**
 * push data to training queue
 */
export const postChunks2Dataset = (data: PushDatasetDataProps) =>
  POST<PushDataResponse>(`/core/dataset/data/pushData`, data);

/**
 * insert one data to dataset (immediately insert)
 */
export const postInsertData2Dataset = (data: InsertOneDatasetDataProps) =>
  POST<string>(`/core/dataset/data/insertData`, data);

/**
 * update one datasetData by id
 */
export const putDatasetDataById = (data: UpdateDatasetDataProps) =>
  PUT('/core/dataset/data/update', data);
/**
 * 删除一条知识库数据
 */
export const delOneDatasetDataById = (dataId: string) =>
  DELETE<string>(`/core/dataset/data/delete`, { dataId });

/* ================ training ==================== */
/* get length of system training queue */
export const getTrainingQueueLen = () => GET<number>(`/core/dataset/training/getQueueLen`);

/* ================== file ======================== */
export const getFileViewUrl = (fileId: string) =>
  GET<string>('/core/dataset/file/getPreviewUrl', { fileId });
