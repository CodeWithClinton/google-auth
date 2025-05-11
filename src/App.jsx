import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from './components/GoogleLoginButton'

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleLoginButton />
    </GoogleOAuthProvider>
  )
}

export default App
// http://localhost:3000/reset-password/?token=cm6t3a-eafeb4a07e8bf36016a7a852b7af4587&email=nwachukwuclinton2018@gmail.com
