import Head from 'next/head'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Home(props: any) {
  const { data: session } = useSession()

  return (
    <div>
      

      <main className='border border-red-700 bg-body'>
        {session && <>
          <div>Welcome, {session.user?.name}</div>         
          <button onClick={() => signOut()}>Logout</button>         
        </>}
        
        {!session && <>
          <button onClick={() => signIn()}>Login now</button>
        </>}
      </main>
    </div>
  )
}