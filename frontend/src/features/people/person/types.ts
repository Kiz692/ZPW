/**
 * Person Types
 * TypeScript types for Person entities
 */

export interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  genderCode: string;
  nationalityCode: string;
  contacts?: PersonContact[];
  identifiers?: PersonIdentifier[];
  createdAt: string;
  updatedAt?: string;
}

export interface PersonContact {
  id: string;
  personId: string;
  contactType: 'EMAIL' | 'MOBILE' | 'PHONE' | 'ADDRESS' | 'OTHER';
  contactValue: string;
  isPrimary: boolean;
  label?: string;
  countryCode?: string;
}

export interface PersonIdentifier {
  id: string;
  personId: string;
  identifierType: string;
  identifierValue: string;
  countryCode: string;
  validFrom?: string;
  validTo?: string;
}

export interface CreatePersonRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  genderCode: string;
  nationalityCode: string;
  contacts?: Omit<PersonContact, 'id' | 'personId'>[];
  identifiers?: Omit<PersonIdentifier, 'id' | 'personId'>[];
}

export interface UpdatePersonRequest extends Partial<CreatePersonRequest> {}
