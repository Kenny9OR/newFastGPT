import { insertData2Dataset } from '@/service/core/dataset/data/controller';
import { MongoDatasetTraining } from '@fastgpt/service/core/dataset/training/schema';
import { TrainingModeEnum } from '@fastgpt/global/core/dataset/constant';
import { sendInform } from '@/pages/api/user/inform/send';
import { addLog } from '@fastgpt/service/common/mongo/controller';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { authTeamBalance } from '@/service/support/permission/auth/bill';
import { pushGenerateVectorBill } from '../common/bill/push';

const reduceQueue = () => {
  global.vectorQueueLen = global.vectorQueueLen > 0 ? global.vectorQueueLen - 1 : 0;
};

/* 索引生成队列。每导入一次，就是一个单独的线程 */
export async function generateVector(): Promise<any> {
  if (global.vectorQueueLen >= global.systemEnv.vectorMaxProcess) return;
  global.vectorQueueLen++;

  // get training data
  const {
    data,
    dataItem,
    done = false,
    error = false
  } = await (async () => {
    try {
      const data = (
        await MongoDatasetTraining.findOneAndUpdate(
          {
            mode: TrainingModeEnum.index,
            lockTime: { $lte: new Date(Date.now() - 1 * 60 * 1000) }
          },
          {
            lockTime: new Date()
          }
        ).select({
          _id: 1,
          userId: 1,
          teamId: 1,
          tmbId: 1,
          datasetId: 1,
          datasetCollectionId: 1,
          q: 1,
          a: 1,
          model: 1,
          billId: 1
        })
      )?.toJSON();

      // task preemption
      if (!data) {
        return {
          done: true
        };
      }
      return {
        data,
        dataItem: {
          q: data.q.replace(/[\x00-\x08]/g, ' '),
          a: data.a?.replace(/[\x00-\x08]/g, ' ') || ''
        }
      };
    } catch (error) {
      console.log(`Get Training Data error`, error);
      return {
        error: true
      };
    }
  })();

  if (done) {
    reduceQueue();
    global.vectorQueueLen <= 0 && console.log(`【索引】任务完成`);
    return;
  }
  if (error || !data) {
    reduceQueue();
    return generateVector();
  }

  // auth balance
  try {
    await authTeamBalance(data.teamId);
  } catch (error) {
    // send inform and lock data
    try {
      sendInform({
        type: 'system',
        title: '索引生成任务中止',
        content:
          '由于账号余额不足，索引生成任务中止，重新充值后将会继续。暂停的任务将在 7 天后被删除。',
        userId: data.userId
      });
      console.log('余额不足，暂停向量生成任务');
      await MongoDatasetTraining.findById(data._id, {
        lockTime: new Date('2999/5/5')
      });
    } catch (error) {}
    reduceQueue();
    return generateVector();
  }

  // create vector and insert

  try {
    // insert data to pg
    const { tokenLen } = await insertData2Dataset({
      teamId: data.teamId,
      tmbId: data.teamId,
      datasetId: data.datasetId,
      collectionId: data.datasetCollectionId,
      q: dataItem.q,
      a: dataItem.a,
      model: data.model
    });
    // push bill
    pushGenerateVectorBill({
      teamId: data.teamId,
      tmbId: data.teamId,
      tokenLen: tokenLen,
      model: data.model,
      billId: data.billId
    });

    // delete data from training
    await MongoDatasetTraining.findByIdAndDelete(data._id);
    reduceQueue();
    generateVector();
  } catch (err: any) {
    reduceQueue();
    // log
    if (err?.response) {
      addLog.info('openai error: 生成向量错误', {
        status: err.response?.status,
        stateusText: err.response?.statusText,
        data: err.response?.data
      });
    } else {
      console.log(err);
      addLog.error(getErrText(err, '生成向量错误'));
    }

    // message error or openai account error
    if (
      err?.message === 'invalid message format' ||
      err.response?.data?.error?.type === 'invalid_request_error' ||
      err?.code === 500
    ) {
      addLog.info('invalid message format', {
        dataItem
      });
      try {
        await MongoDatasetTraining.findByIdAndUpdate(data._id, {
          lockTime: new Date('2998/5/5')
        });
      } catch (error) {}
      return generateVector();
    }

    setTimeout(() => {
      generateVector();
    }, 1000);
  }
}
