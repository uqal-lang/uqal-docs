import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HeroBanner() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          One query language.<br />Every database.
        </Heading>
        <p className="hero__subtitle">
          UQAL is a database-agnostic query language with a plugin
          architecture. Write once, run against PostgreSQL, MongoDB,
          Neo4j — or any database you add a module for.
        </p>
        <div className={styles.codeExample}>
          <code>mydb.orders.get_table(where active = true, fields id, name, total)</code>
        </div>
        <p className={styles.codeCaption}>
          Same syntax. Whether <strong>mydb</strong> is PostgreSQL, MongoDB, or Neo4j.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            Get Started — 5 min
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/contributing/module-development">
            Build a Module
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'One Syntax, Any Database',
    description:
      'Learn UQAL once. The same get_table, where, and insert_row work ' +
      'whether your backend is PostgreSQL, MongoDB, Neo4j, or a custom module. ' +
      'Switch databases without rewriting queries.',
  },
  {
    title: 'Plugin Architecture',
    description:
      'The core knows nothing about databases. Every database is a module ' +
      'that plugs into the grammar, type system, and executor. ' +
      'Adding a new database means implementing one interface — not forking the language.',
  },
  {
    title: 'Native Escape Hatch',
    description:
      'When the abstraction is not enough, drop to native: db.sql(), db.mongo(), ' +
      'db.cypher(). Native queries run through a security validator that blocks ' +
      'destructive patterns before execution.',
  },
];

function FeatureCard({title, description}) {
  return (
    <div className={clsx('col col--4', styles.featureCard)}>
      <Heading as="h3">{title}</Heading>
      <p>{description}</p>
    </div>
  );
}

function TrackSection() {
  return (
    <section className={styles.trackSection}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--6', styles.trackCard, styles.trackUser)}>
            <Heading as="h2">Using UQAL</Heading>
            <p>
              Install the CLI, connect your database, and start querying.
              The User Guide covers installation, all language syntax,
              CLI commands, and database-specific behaviour.
            </p>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              Start Here →
            </Link>
          </div>
          <div className={clsx('col col--6', styles.trackCard, styles.trackDev)}>
            <Heading as="h2">Extending UQAL</Heading>
            <p>
              Want to add support for a new database or contribute to the core?
              The Developer Guide covers the architecture, the module interface,
              grammar extensions, and the test compliance suite.
            </p>
            <Link className="button button--secondary button--lg" to="/docs/contributing/architecture">
              Architecture →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.tagline}
      description="UQAL — a database-agnostic query language with a plugin architecture. One syntax for PostgreSQL, MongoDB, Neo4j, and more.">
      <HeroBanner />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((f, i) => <FeatureCard key={i} {...f} />)}
            </div>
          </div>
        </section>
        <TrackSection />
      </main>
    </Layout>
  );
}
