import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { authUser } from '@fastgpt/service/support/user/auth';
import { getUserPlugins2Templates } from '@fastgpt/service/core/plugin/controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { userId } = await authUser({ req, authToken: true });

    jsonRes(res, {
      data: await getUserPlugins2Templates({ userId })
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
