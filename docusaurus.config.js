// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'UQAL',
  tagline: 'One query language for every database.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://uqal.dev',
  baseUrl: '/',

  organizationName: 'uqal',
  projectName: 'uqal',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/uqal/uqal/edit/main/uqal-docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/uqal-social-card.jpg',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'UQAL',
        logo: {
          alt: 'UQAL Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'userSidebar',
            position: 'left',
            label: 'User Guide',
          },
          {
            type: 'docSidebar',
            sidebarId: 'developerSidebar',
            position: 'left',
            label: 'Developer Guide',
          },
          {
            href: 'https://github.com/uqal/uqal',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'User Guide',
            items: [
              {label: 'Getting Started', to: '/docs/getting-started'},
              {label: 'Language Reference', to: '/docs/language-reference'},
              {label: 'CLI Reference', to: '/docs/cli'},
            ],
          },
          {
            title: 'Modules',
            items: [
              {label: 'PostgreSQL', to: '/docs/modules/postgresql'},
              {label: 'MongoDB', to: '/docs/modules/mongodb'},
              {label: 'Neo4j', to: '/docs/modules/neo4j'},
            ],
          },
          {
            title: 'Developer Guide',
            items: [
              {label: 'Architecture', to: '/docs/contributing/architecture'},
              {label: 'Build a Module', to: '/docs/contributing/module-development'},
              {label: 'GitHub', href: 'https://github.com/uqal/uqal'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} UQAL Contributors. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['powershell', 'bash', 'json', 'python'],
      },
    }),
};

export default config;
