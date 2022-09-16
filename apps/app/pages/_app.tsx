import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface MyAppProps extends AppProps<any> {

}

function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  useEffect(() => {
    // if(!session && router.pathname !== "/auth/signin") {
    //   console.log(router.pathname)
    //   console.log(session)
    //   router.push("/auth/signin")
    // }
  })

  // Fix type errors
  const PageComponent = Component as any;

  return (
    <SessionProvider>
      <PageComponent {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;