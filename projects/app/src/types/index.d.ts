import type { Tiktoken } from 'js-tiktoken';
import {
  ChatModelItemType,
  FunctionModelItemType,
  LLMModelItemType,
  VectorModelItemType
} from './model';
import { TrackEventName } from '@/constants/common';

export type PagingData<T> = {
  pageNum: number;
  pageSize: number;
  data: T[];
  total?: number;
};

export type RequestPaging = { pageNum: number; pageSize: number; [key]: any };

declare global {
  var qaQueueLen: number;
  var vectorQueueLen: number;
  var TikToken: Tiktoken;

  var vectorModels: VectorModelItemType[];
  var chatModels: ChatModelItemType[];
  var qaModels: LLMModelItemType[];
  var cqModels: FunctionModelItemType[];
  var extractModels: FunctionModelItemType[];
  var qgModels: LLMModelItemType[];

  var priceMd: string;
  var systemVersion: string;

  interface Window {
    ['pdfjs-dist/build/pdf']: any;
    grecaptcha: any;
    QRCode: any;
    umami?: {
      track: (event: `${TrackEventName}`, data: any) => void;
    };
  }
}
