import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import Head from 'next/head';
import AdminPanelLayout from '../layouts/AdminPanelLayout';
import MainLayout from '../layouts/MainLayout';

interface MyAppProps extends AppProps {}

function MyApp(props: MyAppProps) {
  const { 
    Component, 
    pageProps, 
    router
  } = props;

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
    <SessionProvider>
      <Head>
        <title>Soundcore :: Web Player</title>
        <meta name="description" content="Official TSAlliance private music streaming service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {findLayout(<PageComponent {...pageProps} />)}
      
    </SessionProvider>
  );
}

export default MyApp;