export interface UserInterface {
  id: number;
  email: string;
  createdBy: string;
  userType: userType;
  firstName: string;
  lastName: string;
  otherName?: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: maritalStatus;
  nationality: string;
  phone: string;
  photo: string;
  address: string;
  updatedBy: number;
  accessLevelId: number;
  positionId: number;
  policyId: number;
  isAgent;
}

interface EmployeeInfo {
  id: number;
  firstName: string;
  lastName: string;
  otherName?: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  phone: string;
  photo?: string;
  address?: string | null;
  email: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  active: boolean;
  createdBy: number;
  updatedAt?: Date | null;
  updatedBy?: number | null;
  userType: string;
  accessLevelId?: number | null;
  employeeInfo: EmployeeInfo;
}

enum userType {
  admin = "admin",
  employee = "employee",
  client = "client",
}

enum maritalStatus {
  Single = "Single",
  Married = "Married",
  Divorced = "Divorced",
  Widowed = "Widowed",
}
