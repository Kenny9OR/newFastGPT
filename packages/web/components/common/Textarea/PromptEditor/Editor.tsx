import { useState, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import VariablePickerPlugin from './plugins/VariablePickerPlugin';
import { Box } from '@chakra-ui/react';
import styles from './index.module.scss';
import VariablePlugin from './plugins/VariablePlugin';
import { VariableNode } from './plugins/VariablePlugin/node';
import { VariableItemType } from '@fastgpt/global/core/module/type';
import { EditorState, LexicalEditor } from 'lexical';
import { textToEditorState } from './utils';
import { useMemo } from 'react';
import OnBlurPlugin from './plugins/OnBlurPlugin';
import MyIcon from '../../Icon';

export default function Editor({
  h = 200,
  showResize = true,
  showOpenModal = true,
  onOpenModal,
  variables,
  onChange,
  onBlur,
  defaultValue,
  placeholder = ''
}: {
  h?: number;
  showResize?: boolean;
  showOpenModal?: boolean;
  onOpenModal?: () => void;
  variables: VariableItemType[];
  onChange?: (editorState: EditorState) => void;
  onBlur?: (editor: LexicalEditor) => void;
  defaultValue: string;
  placeholder?: string;
}) {
  const [height, setHeight] = useState(h);

  const initialY = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    initialY.current = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - initialY.current;
      setHeight((prevHeight) => (prevHeight + deltaY < h * 0.5 ? h * 0.5 : prevHeight + deltaY));
      initialY.current = e.clientY;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const initialConfig = useMemo(
    () => ({
      namespace: 'promptEditor',
      nodes: [VariableNode],
      editorState: textToEditorState(defaultValue),
      onError: (error: Error) => {
        throw error;
      }
    }),
    [defaultValue]
  );

  return (
    <Box position={'relative'} width={'full'} h={`${height}px`}>
      <LexicalComposer initialConfig={initialConfig} key={defaultValue}>
        <PlainTextPlugin
          contentEditable={<ContentEditable className={styles.contentEditable} />}
          placeholder={
            <Box
              position={'absolute'}
              top={'8px'}
              left={'12px'}
              color={'myGray.500'}
              fontSize={'xs'}
              userSelect={'none'}
              pointerEvents={'none'}
            >
              {placeholder}
            </Box>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={(e) => onChange?.(e)} />
        <VariablePickerPlugin variables={variables} />
        <VariablePlugin />
        <OnBlurPlugin onBlur={onBlur} />
      </LexicalComposer>
      {showResize && (
        <Box
          position={'absolute'}
          right={'0'}
          bottom={'-1'}
          zIndex={999}
          cursor={'ns-resize'}
          px={'2px'}
          onMouseDown={handleMouseDown}
        >
          <MyIcon name={'common/editor/resizer'} width={'14px'} height={'14px'} />
        </Box>
      )}
      {showOpenModal && (
        <Box
          zIndex={1000}
          position={'absolute'}
          bottom={1}
          right={2}
          cursor={'pointer'}
          onClick={onOpenModal}
        >
          <MyIcon name={'common/fullScreenLight'} w={'14px'} color={'myGray.600'} />
        </Box>
      )}
    </Box>
  );
}