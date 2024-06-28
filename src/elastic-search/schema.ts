export const typeDefs = `
type Query {
    hello(name: String): String
   
  }
  type Mutation{
    signUp(signUpData: signUpData) : signUpResponse
    signin(email:String,password:String):signinResponse
    verifyOtp(email : String , otp : String) : verifyResponse
    ForgetPassword(email:String) : response
    resetPassword(email:String , password:String) : result
    resendOtp(email:String) : response
    assignUserToProject(projectId: ID!, userId:[ID!]): Project
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
   user:User
    token:String
  }
  input signUpData {
  userName:String,
  email:String,
  password:String,
  isVerified : Boolean,
  role:RoleType
}
enum RoleType {
  EMPLOYEE
  MANAGER
}
type signUpResponse{
  id:String
  msg:String
  otp:String
}
  type Project {
msg: String
  projectId: String
  userId:String
}
  `;
