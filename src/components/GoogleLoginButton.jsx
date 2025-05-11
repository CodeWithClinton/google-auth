import { GoogleLogin } from "@react-oauth/google";
import { loginUser } from '../utils'

const GoogleLoginButton = () => {

    async function handleLogin(response){

        const {credential} = response
        try{
            const res = await loginUser({token: credential})
            console.log(res)
        }

        catch(err){
            throw new Error(err.message)
        }
        
    }


    const handleGoogleFailure = () => {
        console.log("Google login was unsuccessful. Please try again.");
      };
    
  return (
    <div>
       <GoogleLogin onSuccess={handleLogin} onError={handleGoogleFailure} />
    </div>
  )
}

export default GoogleLoginButton
