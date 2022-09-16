import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { getSession, SessionProvider } from "next-auth/react"
import App from 'next/app'
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface MyAppProps extends AppProps<any> {

}

function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props;
  const { session } = pageProps;
  const router = useRouter();

  useEffect(() => {
    if(!session && router.pathname !== "/auth/signin") {
      router.push("/auth/signin")
    }
  })

  // Fix type errors
  const PageComponent = Component as any;

  return (
    <SessionProvider session={session}>
      <PageComponent {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;