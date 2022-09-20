import '../styles/globals.scss'
import type { AppContext, AppProps } from 'next/app'
import { getSession, SessionProvider } from "next-auth/react"
import Head from 'next/head';
import AdminPanelLayout from '../layouts/AdminPanelLayout';
import MainLayout from '../layouts/MainLayout';
import { AppStore, wrapper } from '../store/store';
import { setAuthenticated, setSession } from '../store/authSlice';
import App from 'next/app';
import { Session } from 'next-auth';
import { Provider } from 'react-redux';

interface MyAppInitialPageProps {
  session?: Session;
  store?: AppStore;
}
interface MyAppProps extends AppProps<MyAppInitialPageProps> {}

function MyApp(props: MyAppProps) {
  const { 
    Component, 
    pageProps, 
    router
  } = props;
  const { session, store } = pageProps;

  // Fix type errors
  const PageComponent = Component as any;

  const findLayout = (page) => {
    // If pathname starts with /admin, then show admin panel layout
    if(router.pathname.startsWith("/admin")) {
      return (<>
        <AdminPanelLayout>
          {page}
        </AdminPanelLayout>
      </>);
    } else {
      // Otherwhise show main layout
      return (<>
        <MainLayout>
          {page}
        </MainLayout>
      </>)
    }
  }

  return (
    <SessionProvider session={session}>
      <Head>
        <title>Soundcore :: Web Player</title>
        <meta name="description" content="Official TSAlliance private music streaming service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {findLayout(<PageComponent {...pageProps} />)}
      
    </SessionProvider>
  );
}

MyApp.getInitialProps = wrapper.getInitialAppProps((store) => async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  const session = await getSession({ req: context.ctx.req });

  await store.dispatch(setAuthenticated(!!session));
  await store.dispatch(setSession(session));
  
  return {
    pageProps: {
      ...appProps,
      session,
    } as MyAppInitialPageProps
  }
});

export default wrapper.withRedux(MyApp);