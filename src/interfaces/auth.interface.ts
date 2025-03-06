
export interface UserInterface {
  name: string
  username: string
  role: string
}

export interface LoginRequestInterface {
  username: string
  password: string
}

export interface LoginResponseInterface {
  token: string
}

export interface RegisterRequestInterface {
  name: string
  username: string
  role: string
  password: string
}
