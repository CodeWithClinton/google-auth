import axios from "axios";

export async function loginUser(data){
    try{
        // const response = await axios.post("http://127.0.0.1:8000/auth/google-login/", data)
        const response = await axios.post("https://app.gesturehq.com/auth/google-login/", data)
        return response.data
    }

    catch(err){
        throw new Error(err.message)
    }
}