/**
 * Person Form Component
 * Form for creating and editing persons
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePerson, useUpdatePerson, usePerson } from './hooks/usePerson';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import type { CreatePersonRequest } from './types';

const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  genderCode: z.string().min(1, 'Gender is required'),
  nationalityCode: z.string().min(1, 'Nationality is required'),
});

type PersonFormData = z.infer<typeof personSchema>;

export default function PersonForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: person } = usePerson(id || null);
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
  });

  useEffect(() => {
    if (person) {
      reset({
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        preferredName: person.preferredName,
        dateOfBirth: person.dateOfBirth,
        genderCode: person.genderCode,
        nationalityCode: person.nationalityCode,
      });
    }
  }, [person, reset]);

  const onSubmit = async (data: PersonFormData) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data as CreatePersonRequest);
      }
      navigate('/people/persons');
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Person' : 'Create Person'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" error={errors.firstName?.message} required>
            <Input {...register('firstName')} />
          </FormField>

          <FormField label="Last Name" error={errors.lastName?.message} required>
            <Input {...register('lastName')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Middle Name" error={errors.middleName?.message}>
            <Input {...register('middleName')} />
          </FormField>

          <FormField label="Preferred Name" error={errors.preferredName?.message}>
            <Input {...register('preferredName')} />
          </FormField>
        </div>

        <FormField label="Date of Birth" error={errors.dateOfBirth?.message} required>
          <Input type="date" {...register('dateOfBirth')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Gender" error={errors.genderCode?.message} required>
            <Input {...register('genderCode')} placeholder="e.g., M, F, OTHER" />
          </FormField>

          <FormField label="Nationality" error={errors.nationalityCode?.message} required>
            <Input {...register('nationalityCode')} placeholder="e.g., KE, US" />
          </FormField>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Update' : 'Create'} Person
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/people/persons')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
