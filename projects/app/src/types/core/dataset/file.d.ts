import { FileStatusEnum } from '@fastgpt/global/core/dataset/constant';

export type DatasetFileItemType = {
  id: string;
  size: number;
  filename: string;
  uploadTime: Date;
  chunkLength: number;
  status: `${FileStatusEnum}`;
};
