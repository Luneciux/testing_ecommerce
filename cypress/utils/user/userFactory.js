export default function userFactory(
    {
      email = email | "invalid email", 
      name = name | "invalid name",
      password = password | "invalid password",
    } = userData
) {

  const functions = {
    toString: () => `User { email: ${email}, name: ${name} }`,
    getPassword: () => `Password: ${password}`,
  }
  

  return {
    email,
    name,
    password,
    ...functions
  }

}
