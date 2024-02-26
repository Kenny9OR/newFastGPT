import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamSub } from '@fastgpt/service/support/wallet/sub/schema';
import { getStandardSubPlan } from '@/service/support/wallet/sub/utils';
import { FeTeamPlanStatusType } from '@fastgpt/global/support/wallet/sub/type';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();

    const { teamId } = await authCert({
      req,
      authToken: true
    });
    jsonRes(res, {
      data: await MongoTeamSub.find({ teamId })
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
