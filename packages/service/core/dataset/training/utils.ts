import { DatasetTrainingSchemaType } from '@fastgpt/global/core/dataset/type';
import { addLog } from '../../../common/system/log';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { MongoDatasetTraining } from './schema';

export const checkInvalidChunkAndLock = async ({
  err,
  errText,
  data
}: {
  err: any;
  errText: string;
  data: DatasetTrainingSchemaType;
}) => {
  if (err?.response) {
    addLog.info(`openai error: ${errText}`, {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    });
  } else {
    console.log(err);
    addLog.error(getErrText(err, errText));
  }

  if (
    err?.message === 'invalid message format' ||
    err?.type === 'invalid_request_error' ||
    err?.code === 500
  ) {
    addLog.info('Lock training data');
    console.log(err);

    try {
      await MongoDatasetTraining.findByIdAndUpdate(data._id, {
        lockTime: new Date('2998/5/5')
      });
    } catch (error) {}
    return true;
  }
  return false;
};
