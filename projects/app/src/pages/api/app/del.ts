import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { Chat, connectToDatabase } from '@/service/mongo';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { MongoOutLink } from '@fastgpt/service/support/outLink/schema';
import { authUser } from '@fastgpt/service/support/user/auth';
import { authApp } from '@/service/utils/auth';

/* 获取我的模型 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { appId } = req.query as { appId: string };

    if (!appId) {
      throw new Error('参数错误');
    }

    // 凭证校验
    const { userId } = await authUser({ req, authToken: true });

    // 验证是否是该用户的 app
    await authApp({
      appId,
      userId
    });

    // 删除对应的聊天
    await Chat.deleteMany({
      appId
    });

    // 删除分享链接
    await MongoOutLink.deleteMany({
      appId
    });

    // 删除模型
    await MongoApp.deleteOne({
      _id: appId,
      userId
    });

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
