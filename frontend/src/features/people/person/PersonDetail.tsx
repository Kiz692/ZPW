/**
 * Person Detail Component
 * Displays detailed information about a person
 */

import { usePerson } from './hooks/usePerson';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Edit, ArrowLeft } from 'lucide-react';

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: person, isLoading } = usePerson(id || null);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!person) {
    return <div>Person not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/people/persons')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {person.firstName} {person.lastName}
          </h1>
        </div>
        <Button onClick={() => navigate(`/people/persons/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">First Name:</span>
                <p className="font-medium">{person.firstName}</p>
              </div>
              {person.middleName && (
                <div>
                  <span className="text-sm text-muted-foreground">Middle Name:</span>
                  <p className="font-medium">{person.middleName}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Last Name:</span>
                <p className="font-medium">{person.lastName}</p>
              </div>
              {person.preferredName && (
                <div>
                  <span className="text-sm text-muted-foreground">Preferred Name:</span>
                  <p className="font-medium">{person.preferredName}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Date of Birth:</span>
                <p className="font-medium">{new Date(person.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Gender:</span>
                <p className="font-medium">{person.genderCode}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Nationality:</span>
                <p className="font-medium">{person.nationalityCode}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {person.contacts && person.contacts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Contacts</h2>
              <div className="space-y-2">
                {person.contacts.map((contact) => (
                  <div key={contact.id} className="border rounded p-2">
                    <div className="font-medium">{contact.contactType}</div>
                    <div className="text-sm text-muted-foreground">{contact.contactValue}</div>
                    {contact.isPrimary && (
                      <span className="text-xs text-primary">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {person.identifiers && person.identifiers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Identifiers</h2>
              <div className="space-y-2">
                {person.identifiers.map((identifier) => (
                  <div key={identifier.id} className="border rounded p-2">
                    <div className="font-medium">{identifier.identifierType}</div>
                    <div className="text-sm text-muted-foreground">{identifier.identifierValue}</div>
                    <div className="text-xs text-muted-foreground">{identifier.countryCode}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
