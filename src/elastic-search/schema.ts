export const typeDefs = `
type Query {
    hello(name: String): String
   
  }
  type Mutation{
    signUp(signUpData: signUpData) : signUpResponse
    signin(email:String,password:String):signinResponse
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
