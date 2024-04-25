import { getUserChatInfoAndAuthTeamPoints } from '@/service/support/permission/auth/team';
import { getNextTimeByCronStringAndTimezone } from '@fastgpt/global/common/string/time';
import { delay } from '@fastgpt/global/common/system/utils';
import {
  getDefaultEntryNodeIds,
  initWorkflowEdgeStatus,
  storeNodes2RuntimeNodes
} from '@fastgpt/global/core/workflow/runtime/utils';
import { addLog } from '@fastgpt/service/common/system/log';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { dispatchWorkFlow } from '@fastgpt/service/core/workflow/dispatch';

export const getScheduleTriggerApp = async () => {
  // 1. Find all the app
  const apps = await MongoApp.find({
    scheduledTriggerConfig: { $ne: null },
    scheduledTriggerNextTime: { $lte: new Date() }
  });

  // 2. Run apps
  await Promise.allSettled(
    apps.map(async (app) => {
      if (!app.scheduledTriggerConfig) return;
      // random delay 0 ~ 60s
      await delay(Math.floor(Math.random() * 60 * 1000));
      const { user } = await getUserChatInfoAndAuthTeamPoints(app.tmbId);

      try {
        await dispatchWorkFlow({
          user,
          mode: 'chat',
          teamId: String(app.teamId),
          tmbId: String(app.tmbId),
          appId: String(app._id),
          runtimeNodes: storeNodes2RuntimeNodes(app.modules, getDefaultEntryNodeIds(app.modules)),
          runtimeEdges: initWorkflowEdgeStatus(app.edges),
          variables: {
            userChatInput: app.scheduledTriggerConfig?.defaultPrompt
          },
          histories: [],
          stream: false,
          detail: false,
          maxRunTimes: 200
        });
      } catch (error) {
        addLog.error('Schedule trigger error', error);
      }

      // update next time
      app.scheduledTriggerNextTime = getNextTimeByCronStringAndTimezone(app.scheduledTriggerConfig);
      await app.save();

      return;
    })
  );
};
