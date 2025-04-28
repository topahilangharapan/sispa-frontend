import type { RegisterRequestInterface, RegisterResponseInterface} from './auth.interface.ts'
import type { UserProfileInterface } from './user.interface.ts'

export interface CreateFreelancerRequestInterface extends RegisterRequestInterface {
  email:string,
  name:string,
  address: string,
  phoneNumber: string,
  placeOfBirth: string,
  dateOfBirth: string,
  education: string,
  workExperiences: CreateWorkExperienceRequestInterface[],
  reason: string,
  nik: string
}

export interface CreateWorkExperienceRequestInterface {
  tempId: string,
  category: string,
  title: string,
  description: string,
  isStillWorking: boolean,
  startDate: string,
  endDate: string
}

export interface WorkExperienceCategoryInterface {
  id: number;
  name: string;
}

export interface EducationLevelInterface {
  id: number;
  name: string;
}

export interface CreateFreelancerResponseInterface extends RegisterResponseInterface {
  education: string,
  reason: string,
  isWorking: boolean,
  workExperiences: CreateWorkExperienceResponseInterface[]
}

export interface CreateWorkExperienceResponseInterface {
  category: string,
  title: string,
  description: string,
  isStillWorking: boolean,
  startDate: string,
  endDate: string
}

export interface FreelancerInterface extends UserProfileInterface {
  email:string,
  name:string,
  address: string,
  phoneNumber: string,
  placeOfBirth: string,
  dateOfBirth: string,
  education: string,
  workExperiences: CreateWorkExperienceRequestInterface[],
  reason: string,
  nik: string,
  isWorking: boolean,
  username: string,
  createdBy?: string,
  createdAt?: string,
  updatedBy?: string,
  updatedAt?: string,
  deletedBy?: string,
  deletedAt?: string,
  approvedAt?: string,
  rejectedAt?: string
}
