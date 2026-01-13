/**
 * Wellness Profile Form Component
 * Form for managing wellness profiles
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateWellnessProfile,
  useUpdateWellnessProfile,
  useWellnessProfile,
} from './hooks/useWellnessProfile';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import type { CreateWellnessProfileRequest } from './types';

const wellnessProfileSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  consentFlag: z.boolean(),
  preferredChannel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'APP']),
  engagementTags: z.array(z.string()).optional(),
});

type WellnessProfileFormData = z.infer<typeof wellnessProfileSchema>;

export default function WellnessProfileForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const { data: profile } = useWellnessProfile(employeeId);
  const isEdit = !!profile;
  const createMutation = useCreateWellnessProfile();
  const updateMutation = useUpdateWellnessProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WellnessProfileFormData>({
    resolver: zodResolver(wellnessProfileSchema),
    defaultValues: {
      employeeId: employeeId || undefined,
      consentFlag: false,
      preferredChannel: 'EMAIL',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        employeeId: profile.employeeId,
        consentFlag: profile.consentFlag,
        preferredChannel: profile.preferredChannel,
        engagementTags: profile.engagementTags,
      });
    }
  }, [profile, reset]);

  const consentFlag = watch('consentFlag');

  const onSubmit = async (data: WellnessProfileFormData) => {
    try {
      if (isEdit && profile) {
        await updateMutation.mutateAsync({ id: profile.id, data });
      } else {
        await createMutation.mutateAsync(data as CreateWellnessProfileRequest);
      }
      navigate('/people/wellness');
    } catch (error) {
      console.error('Error saving wellness profile:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? 'Edit Wellness Profile' : 'Create Wellness Profile'}
      </h1>

      {!consentFlag && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Wellness data is protected from punitive use. This information
            is for engagement and coaching purposes only.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField label="Employee ID" error={errors.employeeId?.message} required>
          <Input {...register('employeeId')} disabled={isEdit} />
        </FormField>

        <FormField label="Consent for Wellness Programs" error={errors.consentFlag?.message}>
          <input type="checkbox" {...register('consentFlag')} className="mr-2" />
          <span className="text-sm">I consent to participate in wellness programs</span>
        </FormField>

        <FormField label="Preferred Communication Channel" error={errors.preferredChannel?.message}>
          <select
            {...register('preferredChannel')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="APP">App</option>
          </select>
        </FormField>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Update' : 'Create'} Wellness Profile
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/people/wellness')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
