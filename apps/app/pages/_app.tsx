import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { Session } from 'next-auth';
import Head from 'next/head';

interface MyAppProps extends AppProps<any> {
  session?: Session;
}

function MyApp(props: MyAppProps) {
  const { 
    Component, 
    pageProps, 
  } = props;

  // Fix type errors
  const PageComponent = Component as any;

  return (
    <SessionProvider>
      <Head>
        <title>Soundcore :: Web Player</title>
        <meta name="description" content="Official TSAlliance private music streaming service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <PageComponent {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;