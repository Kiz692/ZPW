/**
 * Contract Form Component
 * Form for creating and editing employment contracts
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateContract, useUpdateContract, useContract } from './hooks/useContract';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import type { CreateContractRequest } from './types';

const contractSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  contractType: z.string().min(1, 'Contract type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  probationEndDate: z.string().optional(),
  standardHoursPerWeek: z.number().optional(),
  standardDaysPerWeek: z.number().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ENDED']).optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function ContractForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const isEdit = !!id;
  const { data: contract } = useContract(id || null);
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: 'DRAFT',
      employeeId: employeeId || undefined,
    },
  });

  useEffect(() => {
    if (contract) {
      reset({
        employeeId: contract.employeeId,
        contractType: contract.contractType,
        startDate: contract.startDate,
        endDate: contract.endDate,
        probationEndDate: contract.probationEndDate,
        standardHoursPerWeek: contract.standardHoursPerWeek,
        standardDaysPerWeek: contract.standardDaysPerWeek,
        status: contract.status,
      });
    }
  }, [contract, reset]);

  const onSubmit = async (data: ContractFormData) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data as CreateContractRequest);
      }
      navigate('/people/contracts');
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Contract' : 'Create Contract'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField label="Employee ID" error={errors.employeeId?.message} required>
          <Input {...register('employeeId')} disabled={isEdit || !!employeeId} />
        </FormField>

        <FormField label="Contract Type" error={errors.contractType?.message} required>
          <select
            {...register('contractType')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select contract type</option>
            <option value="PERMANENT">Permanent</option>
            <option value="FIXED_TERM">Fixed Term</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" error={errors.startDate?.message} required>
            <Input type="date" {...register('startDate')} />
          </FormField>

          <FormField label="End Date" error={errors.endDate?.message}>
            <Input type="date" {...register('endDate')} />
          </FormField>
        </div>

        <FormField label="Probation End Date" error={errors.probationEndDate?.message}>
          <Input type="date" {...register('probationEndDate')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Standard Hours Per Week"
            error={errors.standardHoursPerWeek?.message}
          >
            <Input
              type="number"
              {...register('standardHoursPerWeek', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Standard Days Per Week" error={errors.standardDaysPerWeek?.message}>
            <Input
              type="number"
              {...register('standardDaysPerWeek', { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <FormField label="Status" error={errors.status?.message}>
          <select
            {...register('status')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
          </select>
        </FormField>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Update' : 'Create'} Contract
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/people/contracts')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
