import { darwinAuth } from "#dep/config/axiosDarwin";

const AuthModel = {
  CheckTokenDarwin : async (token : string) => {
    try {
      const { data } = await darwinAuth.post(`/checkToken`, {
        api_key: process.env.APICHCKTOK,
        token: token,
      });
      if(data.status == 0) {
        throw new Error('Forbidden')
      }
    } catch (error) {
      throw error ;
    }
  }
}

export default AuthModel