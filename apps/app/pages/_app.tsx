import '../styles/globals.scss'
import type { AppContext, AppProps } from 'next/app'
import { getSession, SessionProvider } from "next-auth/react"
import Head from 'next/head';
import AdminPanelLayout from '../layouts/AdminPanelLayout';
import MainLayout from '../layouts/MainLayout';
import { wrapper } from '../store/store';
import { setSession } from '../store/authSlice';
import App from 'next/app';
import { Session } from 'next-auth';
import BlankLayout from '../layouts/BlankLayout';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';

interface MyAppInitialPageProps {
  session?: Session;
}
interface MyAppProps extends AppProps<MyAppInitialPageProps> {}

function MyApp(props: MyAppProps) {
  const { 
    Component, 
    pageProps, 
    router
  } = props;
  const { session } = pageProps;
  const store = useStore();

  // Fix type errors
  const PageComponent = Component as any;

  // Get layout of the current page
  const findLayout = (page, loading) => {
    // If pathname starts with /admin, then show admin panel layout
    if(router.pathname.startsWith("/admin")) {
      return <AdminPanelLayout>{page}</AdminPanelLayout>;
    } else if(router.pathname.startsWith("/auth")) {
      return <BlankLayout>{page}</BlankLayout>;
    } else {
      // Otherwhise show main layout
      return <MainLayout loading={loading}>{page}</MainLayout>;
    }
  }

  // Handle loading state on page transitions
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Define event handlers
    const handleRoutingStarted = (url) => (url !== router.asPath) && setLoading(true);
    const handleRoutingCompleted = (url) => (url === router.asPath) && setLoading(false);

    // Register event listeners
    router.events.on("routeChangeStart", (url) => handleRoutingStarted(url));
    router.events.on("routeChangeError", (url) => handleRoutingCompleted(url));
    router.events.on("routeChangeComplete", (url) => handleRoutingCompleted(url));

    // Unregister event listeners
    return () => {
      router.events.off("routeChangeStart", handleRoutingStarted);
      router.events.off("routeChangeError", handleRoutingCompleted);
      router.events.off("routeChangeComplete", handleRoutingCompleted);
    }
  });
  
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Soundcore :: Web Player</title>
        <meta name="description" content="Official TSAlliance private music streaming service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {findLayout(<PageComponent {...pageProps} />, loading)}
      
    </SessionProvider>
  );
}

MyApp.getInitialProps = wrapper.getInitialAppProps((store) => async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  const session = await getSession({ req: context.ctx.req });

  await store.dispatch(setSession(session));
  
  return {
    pageProps: {
      ...appProps,
      session,
    } as MyAppInitialPageProps
  }
});

export default wrapper.withRedux(MyApp);