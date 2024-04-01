import { getNanoid } from '@fastgpt/global/common/string/tools';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import decompress from 'decompress';
import { DOMParser } from '@xmldom/xmldom';
import { clearDirFiles } from '../utils';
import { addLog } from '../../system/log';

const DEFAULTDECOMPRESSSUBLOCATION = '/tmp';

function getNewFileName(ext: string) {
  return `${DEFAULTDECOMPRESSSUBLOCATION}/${getNanoid()}.${ext}`;
}

const parsePowerPoint = async ({
  filepath,
  decompressPath,
  encoding
}: {
  filepath: string;
  decompressPath: string;
  encoding: BufferEncoding;
}) => {
  const parseString = (xml: string) => {
    let parser = new DOMParser();
    return parser.parseFromString(xml, 'text/xml');
  };

  // Files regex that hold our content of interest
  const allFilesRegex = /ppt\/(notesSlides|slides)\/(notesSlide|slide)\d+.xml/g;
  const slidesRegex = /ppt\/slides\/slide\d+.xml/g;

  /** The decompress location which contains the filename in it */

  const files = await decompress(filepath, decompressPath, {
    filter: (x) => !!x.path.match(allFilesRegex)
  });

  // Verify if atleast the slides xml files exist in the extracted files list.
  if (
    files.length == 0 ||
    !files.map((file) => file.path).some((filename) => filename.match(slidesRegex))
  ) {
    return Promise.reject('解析 PPT 失败');
  }

  // Returning an array of all the xml contents read using fs.readFileSync
  const xmlContentArray = files.map((file) =>
    fs.readFileSync(`${decompressPath}/${file.path}`, encoding)
  );

  let responseArr: string[] = [];

  xmlContentArray.forEach((xmlContent) => {
    /** Find text nodes with a:p tags */
    const xmlParagraphNodesList = parseString(xmlContent).getElementsByTagName('a:p');

    /** Store all the text content to respond */
    responseArr.push(
      Array.from(xmlParagraphNodesList)
        // Filter paragraph nodes than do not have any text nodes which are identifiable by a:t tag
        .filter((paragraphNode) => paragraphNode.getElementsByTagName('a:t').length != 0)
        .map((paragraphNode) => {
          /** Find text nodes with a:t tags */
          const xmlTextNodeList = paragraphNode.getElementsByTagName('a:t');
          return Array.from(xmlTextNodeList)
            .filter((textNode) => textNode.childNodes[0] && textNode.childNodes[0].nodeValue)
            .map((textNode) => textNode.childNodes[0].nodeValue)
            .join('');
        })
        .join('\n')
    );
  });

  return responseArr.join('\n');
};

export const parseOffice = async (buffer: Buffer, encoding: BufferEncoding) => {
  // Prepare file for processing
  // create temp file subdirectory if it does not exist
  if (!fs.existsSync(DEFAULTDECOMPRESSSUBLOCATION)) {
    fs.mkdirSync(DEFAULTDECOMPRESSSUBLOCATION, { recursive: true });
  }

  const data = await fileTypeFromBuffer(buffer);

  if (!data) {
    return Promise.reject('error');
  }

  // temp file name
  const filepath = getNewFileName(data.ext.toLowerCase());
  const decompressPath = `${DEFAULTDECOMPRESSSUBLOCATION}/${getNanoid()}`;
  //   const decompressPath = `${DEFAULTDECOMPRESSSUBLOCATION}/test`;

  // write new file
  fs.writeFileSync(filepath, buffer, {
    encoding
  });

  const text = await (async () => {
    try {
      switch (data.ext.toLowerCase()) {
        case 'pptx':
          return parsePowerPoint({ filepath, decompressPath, encoding });

        default:
          return Promise.reject('只能读取 .pptx 文件');
      }
    } catch (error) {
      addLog.error(`Load ppt error`, { error });
    }
    return '';
  })();

  fs.unlinkSync(filepath);
  clearDirFiles(decompressPath);
  return text;
};