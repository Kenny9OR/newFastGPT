import { UrlFetchParams, UrlFetchResponse } from '@fastgpt/global/common/file/api';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { htmlToMarkdown } from './markdown';

export const cheerioToHtml = ({
  fetchUrl,
  $,
  selector
}: {
  fetchUrl: string;
  $: cheerio.CheerioAPI;
  selector?: string;
}) => {
  // get origin url
  const originUrl = new URL(fetchUrl).origin;

  const usedSelector = selector || 'body';
  const selectDom = $(usedSelector);

  // remove i element
  selectDom.find('i,script').remove();

  // remove empty a element
  selectDom
    .find('a')
    .filter((i, el) => {
      return $(el).text().trim() === '' && $(el).children().length === 0;
    })
    .remove();

  // if link,img startWith /, add origin url
  selectDom.find('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/')) {
      $(el).attr('href', originUrl + href);
    }
  });
  selectDom.find('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('/')) {
      $(el).attr('src', originUrl + src);
    }
  });

  // 微信公众号文章会隐藏内容。
  $('#js_content').removeAttr('style');

  const html = selectDom
    .map((item, dom) => {
      return $(dom).html();
    })
    .get()
    .join('\n');

  const dom = new JSDOM(html, {
    beforeParse(window) {
      window.Canvas = function () {};
    }
  });
  const article = new Readability(dom.window.document).parse();

  return {
    html: article?.content,
    usedSelector
  };
};
export const urlsFetch = async ({
  urlList,
  selector
}: UrlFetchParams): Promise<UrlFetchResponse> => {
  urlList = urlList.filter((url) => /^(http|https):\/\/[^ "]+$/.test(url));

  const response = (
    await Promise.all(
      urlList.map(async (url) => {
        try {
          const fetchRes = await axios.get(url, {
            timeout: 30000
          });

          const $ = cheerio.load(fetchRes.data);
          const { html, usedSelector } = cheerioToHtml({
            fetchUrl: url,
            $,
            selector
          });
          const md = await htmlToMarkdown(html);

          return {
            url,
            content: md,
            selector: usedSelector
          };
        } catch (error) {
          console.log(error, 'fetch error');

          return {
            url,
            content: '',
            selector: ''
          };
        }
      })
    )
  ).filter((item) => item.content);

  return response;
};
