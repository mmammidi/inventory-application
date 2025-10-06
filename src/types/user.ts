export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  username?: string;
}

export interface UserInput {
  firstname: string;
  lastname: string;
  email?: string;
  username?: string;
}
