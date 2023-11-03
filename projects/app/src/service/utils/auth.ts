import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppSchema } from '@fastgpt/global/core/app/type.d';
import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';

// 模型使用权校验
export const authApp = async ({
  appId,
  userId,
  authUser = true,
  authOwner = true
}: {
  appId: string;
  userId: string;
  authUser?: boolean;
  authOwner?: boolean;
}) => {
  // 获取 app 数据
  const app = await MongoApp.findById<AppSchema>(appId);
  if (!app) {
    return Promise.reject('App is not exists');
  }

  /* 
    Access verification
    1. authOwner=true or authUser = true ,  just owner can use
    2. authUser = false and share, anyone can use
  */
  if (authOwner || authUser) {
    if (userId !== String(app.userId)) return Promise.reject(ERROR_ENUM.unAuthModel);
  }

  return {
    app,
    showModelDetail: userId === String(app.userId)
  };
};
