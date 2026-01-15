/**
 * Employee Form Component
 * Form for creating and editing employees
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmployee, useUpdateEmployee, useEmployee } from './hooks/useEmployee';
import { usePersons } from '../person/hooks/usePerson';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import type { CreateEmployeeRequest } from './types';

const employeeSchema = z.object({
  personId: z.string().min(1, 'Person is required'),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  currentStatus: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: employee } = useEmployee(id || null);
  const { data: persons } = usePersons();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      currentStatus: 'PLANNED',
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        personId: employee.personId,
        employeeNumber: employee.employeeNumber,
        hireDate: employee.hireDate,
        employmentType: employee.employmentType,
        currentStatus: employee.currentStatus,
      });
    }
  }, [employee, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data as CreateEmployeeRequest);
      }
      navigate('/people/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Employee' : 'Create Employee'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField label="Person" error={errors.personId?.message} required>
          <select
            {...register('personId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isEdit}
          >
            <option value="">Select a person</option>
            {persons?.map((person) => (
              <option key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Employee Number" error={errors.employeeNumber?.message} required>
          <Input {...register('employeeNumber')} />
        </FormField>

        <FormField label="Hire Date" error={errors.hireDate?.message} required>
          <Input type="date" {...register('hireDate')} />
        </FormField>

        <FormField label="Employment Type" error={errors.employmentType?.message} required>
          <select
            {...register('employmentType')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select employment type</option>
            <option value="PERMANENT">Permanent</option>
            <option value="FIXED_TERM">Fixed Term</option>
            <option value="CASUAL">Casual</option>
            <option value="INTERN">Intern</option>
            <option value="CONSULTANT">Consultant</option>
          </select>
        </FormField>

        <FormField label="Initial Status" error={errors.currentStatus?.message}>
          <select
            {...register('currentStatus')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
          </select>
        </FormField>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Update' : 'Create'} Employee
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/people/employees')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
