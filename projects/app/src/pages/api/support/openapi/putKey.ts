import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoOpenApi } from '@fastgpt/service/support/openapi/schema';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import type { EditApiKeyProps } from '@/global/support/api/openapiReq.d';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { _id, name, limit } = req.body as EditApiKeyProps & { _id: string };
    const { userId } = await authCert({ req, authToken: true });

    await MongoOpenApi.findOneAndUpdate(
      {
        _id,
        userId
      },
      {
        ...(name && { name }),
        ...(limit && { limit })
      }
    );

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
