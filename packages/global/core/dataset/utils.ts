import { TrainingModeEnum, DatasetCollectionTypeEnum, DatasetDataIndexTypeEnum } from './constant';
import { getFileIcon } from '../../common/file/icon';
import { strIsLink } from '../../common/string/tools';

export function getCollectionIcon(
  type: `${DatasetCollectionTypeEnum}` = DatasetCollectionTypeEnum.file,
  name = ''
) {
  if (type === DatasetCollectionTypeEnum.folder) {
    return 'common/folderFill';
  }
  if (type === DatasetCollectionTypeEnum.link) {
    return 'common/linkBlue';
  }
  if (type === DatasetCollectionTypeEnum.virtual) {
    return 'file/fill/manual';
  }
  return getFileIcon(name);
}
export function getSourceNameIcon({
  sourceName,
  sourceId
}: {
  sourceName: string;
  sourceId?: string;
}) {
  if (strIsLink(sourceId)) {
    return 'common/linkBlue';
  }
  const fileIcon = getFileIcon(sourceName, '');
  if (fileIcon) {
    return fileIcon;
  }

  if (sourceName === '手动录入') {
    return 'file/fill/manual';
  } else if (sourceName === '手动标注') {
    return 'file/fill/mark';
  }
  return 'file/fill/collection';
}

export function getDefaultIndex(props?: { q?: string; a?: string; dataId?: string }) {
  const { q = '', a, dataId } = props || {};
  const qaStr = `${q}\n${a}`.trim();
  return {
    defaultIndex: true,
    type: a ? DatasetDataIndexTypeEnum.qa : DatasetDataIndexTypeEnum.chunk,
    text: a ? qaStr : q,
    dataId
  };
}

export const predictDataLimitLength = (mode: `${TrainingModeEnum}`, data: any[]) => {
  if (mode === TrainingModeEnum.qa) return data.length * 20;
  return data.length;
};
