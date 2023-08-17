// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Develop',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Proxy',
          link: {
            type: 'generated-index'
          },
          items: [
            {
              type: 'autogenerated',
              dirName: 'develop/proxy'
            }
          ]
        },
        'develop/dev',
        {
          type: 'category',
          label: 'Data Config',
          link: {
            type: 'generated-index'
          },
          collapsed: false,
          items: [
            {
              type: 'autogenerated',
              dirName: 'develop/data_config'
            }
          ]
        },
        {
          type: 'category',
          label: 'Deploy',
          link: {
            type: 'generated-index'
          },
          items: [
            {
              type: 'autogenerated',
              dirName: 'develop/deploy'
            }
          ]
        },
        'develop/oneapi',
        {
          type: 'category',
          label: 'Version Updating',
          link: {
            type: 'generated-index'
          },
          items: [
            {
              type: 'autogenerated',
              dirName: 'develop/update'
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Datasets',
      link: {
        type: 'generated-index'
      },
      collapsed: false,
      items: [{ type: 'autogenerated', dirName: 'datasets' }]
    },
    {
      type: 'category',
      label: 'Flow Modules',
      link: {
        type: 'generated-index'
      },
      collapsed: false,
      items: [
        'flow-modules/intro',
        {
          type: 'category',
          label: 'Modules Intro',
          link: {
            type: 'generated-index'
          },
          items: [
            {
              type: 'autogenerated',
              dirName: 'flow-modules/modules'
            }
          ]
        },
        {
          type: 'category',
          label: 'Examples',
          link: {
            type: 'generated-index'
          },
          items: [
            {
              type: 'autogenerated',
              dirName: 'flow-modules/examples'
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Other',
      link: {
        type: 'generated-index'
      },
      items: [{ type: 'autogenerated', dirName: 'other' }]
    }
  ]
};

module.exports = sidebars;
