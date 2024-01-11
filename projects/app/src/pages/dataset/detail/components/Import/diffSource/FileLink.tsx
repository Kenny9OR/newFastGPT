import React, { useEffect } from 'react';
import { ImportDataComponentProps } from '@/web/core/dataset/type.d';

import dynamic from 'next/dynamic';
import { useImportStore } from '../Provider';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { Box, Button, Flex, Input, Link, Textarea } from '@chakra-ui/react';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { LinkCollectionIcon } from '@/web/core/dataset/constants';
import { feConfigs } from '@/web/common/system/staticData';
import { getDocPath } from '@/web/common/system/doc';

const DataProcess = dynamic(() => import('../commonProgress/DataProcess'));
const Upload = dynamic(() => import('../commonProgress/Upload'));

const LinkCollection = ({ activeStep, goToNext }: ImportDataComponentProps) => {
  return (
    <>
      {activeStep === 0 && <CustomLinkImport goToNext={goToNext} />}
      {activeStep === 1 && <DataProcess showPreviewChunks={false} goToNext={goToNext} />}
      {activeStep === 2 && <Upload showPreviewChunks={false} />}
    </>
  );
};

export default React.memo(LinkCollection);

const CustomLinkImport = ({ goToNext }: { goToNext: () => void }) => {
  const { t } = useTranslation();
  const { sources, setSources, processParamsForm } = useImportStore();
  const { register, reset, handleSubmit, watch } = useForm({
    defaultValues: {
      link: ''
    }
  });

  const link = watch('link');
  const linkList = link.split('\n').filter((item) => item);

  useEffect(() => {
    reset({
      link: sources
        .map((item) => item.link)
        .filter((item) => item)
        .join('\n')
    });
  }, []);

  return (
    <Box maxW={['100%', '800px']}>
      <Box display={['block', 'flex']} alignItems={'flex-start'} mt={1}>
        <Box flex={'0 0 100px'} fontSize={'sm'}>
          {t('core.dataset.import.Link name')}
        </Box>
        <Textarea
          flex={'1 0 0'}
          w={'100%'}
          rows={10}
          placeholder={t('core.dataset.import.Link name placeholder')}
          bg={'myGray.50'}
          overflowX={'auto'}
          whiteSpace={'nowrap'}
          {...register('link', {
            required: true
          })}
        />
      </Box>
      <Box display={['block', 'flex']} alignItems={'center'} mt={4}>
        <Box flex={'0 0 100px'} fontSize={'sm'}>
          {t('core.dataset.website.Selector')}
          <Box color={'myGray.500'} fontSize={'sm'}>
            {feConfigs?.docUrl && (
              <Link href={getDocPath('/docs/course/websync/#选择器如何使用')} target="_blank">
                {t('core.dataset.website.Selector Course')}
              </Link>
            )}
          </Box>
        </Box>
        <Input
          flex={'1 0 0'}
          maxW={['100%', '350px']}
          {...processParamsForm.register('webSelector')}
          placeholder={'body .content #document'}
          bg={'myGray.50'}
        />
      </Box>

      <Flex my={4} flexWrap={'wrap'} gap={4} alignItems={'center'} pl={[0, '100px']}>
        {linkList.map((item, i) => (
          <Flex
            key={`${item}-${i}`}
            alignItems={'center'}
            px={4}
            py={2}
            borderRadius={'md'}
            bg={'myGray.100'}
          >
            <MyIcon name={LinkCollectionIcon} w={'16px'} />
            <Box ml={1} mr={3} wordBreak={'break-all'}>
              {item}
            </Box>
            <MyIcon
              name={'common/closeLight'}
              w={'14px'}
              color={'myGray.500'}
              cursor={'pointer'}
              onClick={() => {
                const newLinkList = linkList.filter((link, index) => index !== i);
                reset({
                  link: newLinkList.join('\n')
                });
              }}
            />
          </Flex>
        ))}
      </Flex>
      <Flex mt={5} justifyContent={'flex-end'}>
        <Button
          onClick={handleSubmit((data) => {
            const newLinkList = data.link.split('\n').filter((item) => item);

            setSources(
              newLinkList.map((link) => ({
                id: getNanoid(32),
                link,
                rawText: '',
                chunks: [],
                tokens: 0,
                sourceName: link,
                icon: LinkCollectionIcon
              }))
            );

            goToNext();
          })}
        >
          {t('common.Next Step')}
        </Button>
      </Flex>
    </Box>
  );
};
