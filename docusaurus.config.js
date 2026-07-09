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

  url: 'https://uqal-lang.github.io',
  baseUrl: '/uqal-docs/',

  organizationName: 'uqal-lang',
  projectName: 'uqal-docs',

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
          editUrl: 'https://github.com/uqal-lang/uqal-docs/edit/main/',
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
            href: 'https://github.com/uqal-lang/uqal-docs',
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
              {label: 'PostgreSQL', to: '/docs/modules/standard/postgresql'},
              {label: 'MongoDB', to: '/docs/modules/standard/mongodb'},
              {label: 'Neo4j', to: '/docs/modules/standard/neo4j'},
            ],
          },
          {
            title: 'Developer Guide',
            items: [
              {label: 'Architecture', to: '/docs/contributing/architecture'},
              {label: 'Build a Module', to: '/docs/contributing/module-development'},
              {label: 'GitHub', href: 'https://github.com/uqal-lang/uqal-docs'},
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
