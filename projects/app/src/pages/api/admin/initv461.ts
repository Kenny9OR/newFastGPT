import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { delay } from '@/utils/tools';
import { PgClient } from '@fastgpt/service/common/pg';
import {
  DatasetDataIndexTypeEnum,
  PgDatasetTableName
} from '@fastgpt/global/core/dataset/constant';

import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';

let success = 0;
/* pg 中的数据搬到 mongo dataset.datas 中，并做映射 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = 50 } = req.body as { limit: number };
    await authCert({ req, authRoot: true });
    await connectToDatabase();
    success = 0;

    try {
      await Promise.allSettled([
        await PgClient.query(`ALTER TABLE ${PgDatasetTableName} ADD COLUMN data_id VARCHAR(50);`),
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} DROP COLUMN inited;`),
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} ALTER COLUMN q DROP NOT NULL;`), // q can null
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} ALTER COLUMN a DROP NOT NULL;`), // a can null
        PgClient.query(
          `ALTER TABLE ${PgDatasetTableName} ALTER COLUMN team_id TYPE VARCHAR(50) USING team_id::VARCHAR(50);`
        ), // team_id varchar
        PgClient.query(
          `ALTER TABLE ${PgDatasetTableName} ALTER COLUMN tmb_id TYPE VARCHAR(50) USING tmb_id::VARCHAR(50);`
        ), // tmb_id varchar
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} ALTER COLUMN team_id SET NOT NULL;`), // team_id not null
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} ALTER COLUMN tmb_id SET NOT NULL;`), // tmb_id not null
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} ALTER COLUMN dataset_id SET NOT NULL;`), // dataset_id not null
        PgClient.query(`ALTER TABLE ${PgDatasetTableName} ALTER COLUMN collection_id SET NOT NULL;`) // collection_id not null
      ]);
    } catch (error) {}

    const { rows } = await PgClient.query(
      `SELECT count(id) FROM ${PgDatasetTableName} WHERE data_id IS NULL`
    );
    console.log('totalCount', rows[0]);

    jsonRes(res, {
      data: await init(limit)
    });
  } catch (error) {
    console.log(error);

    jsonRes(res, {
      code: 500,
      error
    });
  }
}

type PgItemType = {
  id: string;
  q: string;
  a: string;
  dataset_id: string;
  collection_id: string;
  team_id: string;
  tmb_id: string;
};

async function init(limit: number) {
  // get limit data where data_id is null
  const { rows } = await PgClient.query<PgItemType>(
    `SELECT id,q,a,dataset_id,collection_id,team_id,tmb_id FROM ${PgDatasetTableName} WHERE data_id IS NULL LIMIT ${limit};`
  );
  if (rows.length === 0) return;

  await Promise.all(rows.map(initData));

  async function initData(item: PgItemType) {
    let id = '';
    try {
      // create mongo data and update data_id
      const { _id } = await MongoDatasetData.create({
        teamId: item.team_id.trim(),
        tmbId: item.tmb_id.trim(),
        datasetId: item.dataset_id,
        collectionId: item.collection_id,
        q: item.q,
        a: item.a,
        indexes: [
          {
            defaultIndex: !item.a,
            type: item.a ? DatasetDataIndexTypeEnum.qa : DatasetDataIndexTypeEnum.chunk,
            dataId: item.id,
            text: item.q
          }
        ]
      });
      id = _id;
      await PgClient.query(
        `UPDATE ${PgDatasetTableName} SET data_id='${String(_id)}' WHERE id='${item.id}';`
      );
    } catch (error) {
      try {
        if (id) {
          await MongoDatasetData.findByIdAndDelete(id);
        }
      } catch (error) {}
      console.log(error);
      await delay(500);
      return initData(item);
    }
  }

  success += limit;
  console.log(success);

  return init(limit);
}
