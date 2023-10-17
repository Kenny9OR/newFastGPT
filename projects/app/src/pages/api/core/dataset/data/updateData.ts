import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { authUser } from '@fastgpt/service/support/user/auth';
import { PgClient } from '@/service/pg';
import { withNextCors } from '@fastgpt/service/common/middle/cors';
import { connectToDatabase } from '@/service/mongo';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { getVector } from '@/pages/api/openapi/plugin/vector';
import { PgDatasetTableName } from '@/constants/plugin';
import type { UpdateDatasetDataPrams } from '@/global/core/api/datasetReq.d';

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { dataId, a = '', q = '', kbId } = req.body as UpdateDatasetDataPrams;

    if (!dataId) {
      throw new Error('缺少参数');
    }

    // auth user and get kb
    const [{ userId }, kb] = await Promise.all([
      authUser({ req, authToken: true }),
      MongoDataset.findById(kbId, 'vectorModel')
    ]);

    if (!kb) {
      throw new Error("Can't find database");
    }

    // get vector
    const { vectors = [] } = await (async () => {
      if (q) {
        return getVector({
          userId,
          input: [q],
          model: kb.vectorModel
        });
      }
      return { vectors: [[]] };
    })();

    // 更新 pg 内容.仅修改a，不需要更新向量。
    await PgClient.update(PgDatasetTableName, {
      where: [['id', dataId], 'AND', ['user_id', userId]],
      values: [
        { key: 'a', value: a.replace(/'/g, '"') },
        ...(q
          ? [
              { key: 'q', value: q.replace(/'/g, '"') },
              { key: 'vector', value: `[${vectors[0]}]` }
            ]
          : [])
      ]
    });

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
});
