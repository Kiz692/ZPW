/**
 * Employee Detail Component
 * Displays detailed information about an employee
 */

import { useEmployee } from './hooks/useEmployee';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Edit, ArrowLeft } from 'lucide-react';
import EmployeeStatusHistory from './EmployeeStatusHistory';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id || null);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/people/employees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {employee.person
              ? `${employee.person.firstName} ${employee.person.lastName}`
              : 'Unknown Person'}
          </h1>
        </div>
        <Button onClick={() => navigate(`/people/employees/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Employment Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Employee Number:</span>
                <p className="font-medium">{employee.employeeNumber}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Hire Date:</span>
                <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Employment Type:</span>
                <p className="font-medium">{employee.employmentType}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Current Status:</span>
                <p className="font-medium">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      employee.currentStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : employee.currentStatus === 'PROBATION'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {employee.currentStatus}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status Effective Date:</span>
                <p className="font-medium">
                  {new Date(employee.currentStatusEffectiveDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <EmployeeStatusHistory employeeId={id!} />
        </div>
      </div>
    </div>
  );
}
