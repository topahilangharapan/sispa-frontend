export interface UserProfileInterface {
  id: number;
  name: string;
  email: string;
  address?: string;
  phoneNumber?: string;
  placeOfBirth?: string;   
  dateOfBirth?: string;  
  role?: string;      
}

export interface UserStateInterface {
  loading: boolean;
  error: string | null;
  profile: UserProfileInterface;
}