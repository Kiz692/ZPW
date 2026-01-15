/**
 * Wellness Profile View Component
 * Displays wellness profile information
 */

import { useWellnessProfile } from './hooks/useWellnessProfile';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';

export default function WellnessProfileView() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const { data: profile, isLoading } = useWellnessProfile(employeeId);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!profile) {
    return <div>Wellness profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wellness Profile</h1>

      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Protection Notice:</strong> Wellness data is protected from punitive use. This
          information is for engagement and coaching purposes only.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Wellness Settings</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Consent:</span>
                <p className="font-medium">{profile.consentFlag ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Preferred Channel:</span>
                <p className="font-medium">{profile.preferredChannel}</p>
              </div>
              {profile.engagementTags && profile.engagementTags.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Engagement Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.engagementTags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
