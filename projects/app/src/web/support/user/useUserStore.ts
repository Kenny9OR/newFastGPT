import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { UserUpdateParams } from '@/types/user';
import type { UserType } from '@fastgpt/global/support/user/type.d';
import { getMyApps, getModelById, putAppById } from '@/web/core/app/api';
import { formatPrice } from '@fastgpt/global/support/wallet/bill/tools';
import { getTokenLogin, putUserInfo } from '@/web/support/user/api';
import { defaultApp } from '@/constants/model';
import { AppListItemType, AppUpdateParams } from '@/types/app';

import { AppSchema } from '@fastgpt/global/core/app/type.d';

type State = {
  lastTmbId: string;
  setLastTmbId: (tmbId?: string) => void;
  userInfo: UserType | null;
  initUserInfo: () => Promise<UserType>;
  setUserInfo: (user: UserType | null) => void;
  updateUserInfo: (user: UserUpdateParams) => Promise<void>;
  myApps: AppListItemType[];
  myCollectionApps: AppListItemType[];
  loadMyApps: (init?: boolean) => Promise<AppListItemType[]>;
  appDetail: AppSchema;
  loadAppDetail: (id: string, init?: boolean) => Promise<AppSchema>;
  updateAppDetail(appId: string, data: AppUpdateParams): Promise<void>;
  clearAppModules(): void;
};

export const useUserStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        lastTmbId: '',
        setLastTmbId(tmbId) {
          if (tmbId) {
            set((state) => {
              state.lastTmbId = tmbId;
            });
          }
        },
        userInfo: null,
        async initUserInfo() {
          const res = await getTokenLogin();
          get().setUserInfo(res);
          get().setLastTmbId(res.team?.tmbId);

          return res;
        },
        setUserInfo(user: UserType | null) {
          get().setLastTmbId(user?.team?.tmbId);
          set((state) => {
            state.userInfo = user
              ? {
                  ...user,
                  balance: formatPrice(user.balance)
                }
              : null;
          });
        },
        async updateUserInfo(user: UserUpdateParams) {
          const oldInfo = (get().userInfo ? { ...get().userInfo } : null) as UserType | null;
          set((state) => {
            if (!state.userInfo) return;
            state.userInfo = {
              ...state.userInfo,
              ...user
            };
          });
          try {
            await putUserInfo(user);
          } catch (error) {
            set((state) => {
              state.userInfo = oldInfo;
            });
            return Promise.reject(error);
          }
        },
        myApps: [],
        myCollectionApps: [],
        async loadMyApps(init = true) {
          if (get().myApps.length > 0 && !init) return [];
          const res = await getMyApps();
          set((state) => {
            state.myApps = res;
          });
          return res;
        },
        appDetail: defaultApp,
        async loadAppDetail(id: string, init = false) {
          if (id === get().appDetail._id && !init) return get().appDetail;

          const res = await getModelById(id);
          set((state) => {
            state.appDetail = res;
          });
          return res;
        },
        async updateAppDetail(appId: string, data: AppUpdateParams) {
          await putAppById(appId, data);
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              ...data
            };
          });
        },
        clearAppModules() {
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              modules: []
            };
          });
        }
      })),
      {
        name: 'userStore',
        partialize: (state) => ({
          lastTmbId: state.lastTmbId
        })
      }
    )
  )
);
