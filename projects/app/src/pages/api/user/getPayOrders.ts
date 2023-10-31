import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authUser } from '@fastgpt/service/support/user/auth';
import { connectToDatabase } from '@/service/mongo';
import { MongoPay } from '@fastgpt/service/support/wallet/pay/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { userId } = await authUser({ req, authToken: true });

    const records = await MongoPay.find({
      userId,
      status: { $ne: 'CLOSED' }
    })
      .sort({ createTime: -1 })
      .limit(100);

    jsonRes(res, {
      data: records
    });
  } catch (err) {
    console.log(err);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
