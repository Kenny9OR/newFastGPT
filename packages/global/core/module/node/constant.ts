export enum FlowNodeInputTypeEnum {
  systemInput = 'systemInput', // history, userChatInput, variableInput

  input = 'input', // one line input
  textarea = 'textarea',
  numberInput = 'numberInput',
  select = 'select',
  slider = 'slider',
  custom = 'custom',
  target = 'target', // data input
  switch = 'switch',
  selectApp = 'selectApp',
  // chat special input
  aiSettings = 'aiSettings',

  // model select
  selectChatModel = 'selectChatModel',
  selectCQModel = 'selectCQModel',
  selectExtractModel = 'selectExtractModel',

  // dataset special input
  selectDataset = 'selectDataset',
  selectDatasetParamsModal = 'selectDatasetParamsModal',

  hidden = 'hidden'
}

export enum FlowNodeOutputTypeEnum {
  answer = 'answer',
  source = 'source',
  hidden = 'hidden'
}

export enum FlowNodeTypeEnum {
  empty = 'empty',
  userGuide = 'userGuide',
  questionInput = 'questionInput',
  historyNode = 'historyNode',
  chatNode = 'chatNode',
  datasetSearchNode = 'datasetSearchNode',
  answerNode = 'answerNode',
  classifyQuestion = 'classifyQuestion',
  contentExtract = 'contentExtract',
  httpRequest = 'httpRequest',
  runApp = 'app',
  pluginModule = 'pluginModule',
  pluginInput = 'pluginInput',
  pluginOutput = 'pluginOutput',
  textEditor = 'textEditor',
  tfSwitch = 'tfSwitch',

  // abandon
  variable = 'variable'
}
