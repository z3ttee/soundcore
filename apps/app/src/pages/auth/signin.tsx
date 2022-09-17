import { GetServerSideProps } from "next";
import { getProviders, signIn, ClientSafeProvider, getSession, getCsrfToken } from "next-auth/react";
import Image from "next/image";
import { Button } from "@soundcore/ui";

interface SignInProps {
  provider: ClientSafeProvider;
}

export default function SignIn(props: SignInProps) {
    const { provider } = props;
    const currentYear: number = new Date().getFullYear();

    return (
      <div className="flex w-full h-full relative justify-center items-center p-window">
        <div className="block w-full md:w-[500px]">
          <div className="block rounded-lg p-window bg-body-dark bg-opacity-10 border border-body-light border-opacity-60">

            <div className="text-center">
              <Image alt="Soundcore Logo" src="/images/branding/soundcore_logo.svg" width={45} height={45} className="block mx-auto" />
            </div>

            <div className="flex flex-col items-center gap-1 py-row">
              <h2>Willkommen</h2>
              <p className="opacity-80 text-sm">Melde dich an, bevor du loslegen kannst.</p>
            </div>

            <div className="flex flex-col items-center gap-1 py-row">
              <Button 
                className="w-full" 
                startIcon={<Image alt="" src="/images/branding/tsalliance_logo.svg" width={18} height={18} />}
                align="center"
                onClick={() => signIn(provider.id)}>
                Mit TSAlliance anmelden
              </Button>
            </div>
          </div>

          <div className="flex p-box text-xs font-normal items-center justify-center flex-col">
            <p className="text-xs opacity-50 ">&copy; 2022{currentYear > 2022 ? `-${currentYear}` : ''} TSAlliance </p>
          </div>
        </div>
      </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const session = await getSession({ req });
  const providers = await getProviders();

  if(session) {
    return {
      redirect: {
        destination: "/"
      },
      props: {}
    }
  }

  return {
    props: {
      provider: providers?.keycloak,
      csrfToken: await getCsrfToken(context),
    } as SignInProps
  };
}