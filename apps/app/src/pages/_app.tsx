import '../styles/globals.scss'
import type { AppContext, AppProps } from 'next/app'
import { getSession, SessionProvider, useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import App from 'next/app';
import { Session } from 'next-auth';
import Head from 'next/head';

interface MyAppProps extends AppProps<any> {
  session?: Session;
}

function MyApp(props: MyAppProps) {
  const { 
    Component, 
    pageProps, 
    session 
  } = props;

  // Fix type errors
  const PageComponent = Component as any;

  return (
    <SessionProvider session={session}>
      <Head>
        <title>Soundcore :: Web Player</title>
        <meta name="description" content="Official TSAlliance private music streaming service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <PageComponent {...pageProps} />
    </SessionProvider>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const { req } = context.ctx;
  
  const appProps = await App.getInitialProps(context)
  const session = await getSession({ req })
  
  return {
    ...appProps,
    session
  }
}

export default MyApp;