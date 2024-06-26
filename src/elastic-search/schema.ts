export const typeDefs = `
type Query {
    hello(name: String): String
   
  }
  type Mutation{
    signUp(signUpData: signUpData) : signUpResponse
    signin(email:String,password:String):signinResponse
    verifyMail(email : String , otp : String) : verifyResponse
    ForgetPassword(email:String) : response
    resetPassword(email:String , password:String) : result
    resendOTP(email:String) : response
  }

  type result{
  msg:String
}
type verifyResponse {
msg : String,
id : String
}
type response{
  otp:String
  email:String
  msg:String
}
  type signinResponse{
    msg:String
  }
  input signUpData {
  userName:String,
  email:String,
  password:String,
  isVerified : Boolean
}
type signUpResponse{
  id:String
  msg:String
  otp:String
}
  `;
