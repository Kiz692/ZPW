/**
 * People Module
 * Main routing component for People Core features
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import PersonList from './person/PersonList';
import PersonForm from './person/PersonForm';
import PersonDetail from './person/PersonDetail';
import EmployeeList from './employee/EmployeeList';
import EmployeeForm from './employee/EmployeeForm';
import EmployeeDetail from './employee/EmployeeDetail';
import ContractForm from './contract/ContractForm';
import WellnessProfileForm from './wellness/WellnessProfileForm';
import WellnessProfileView from './wellness/WellnessProfileView';
import JoinersLeaversReport from './reports/JoinersLeaversReport';
import StatusChangeReport from './reports/StatusChangeReport';

export default function PeopleModule() {
  return (
    <Routes>
      <Route index element={<Navigate to="persons" replace />} />
      
      {/* Person Routes */}
      <Route path="persons" element={<PersonList />} />
      <Route path="persons/new" element={<PersonForm />} />
      <Route path="persons/:id" element={<PersonDetail />} />
      <Route path="persons/:id/edit" element={<PersonForm />} />
      
      {/* Employee Routes */}
      <Route path="employees" element={<EmployeeList />} />
      <Route path="employees/new" element={<EmployeeForm />} />
      <Route path="employees/:id" element={<EmployeeDetail />} />
      <Route path="employees/:id/edit" element={<EmployeeForm />} />
      
      {/* Contract Routes */}
      <Route path="contracts/new" element={<ContractForm />} />
      <Route path="contracts/:id/edit" element={<ContractForm />} />
      
      {/* Wellness Routes */}
      <Route path="wellness" element={<WellnessProfileView />} />
      <Route path="wellness/new" element={<WellnessProfileForm />} />
      <Route path="wellness/:id/edit" element={<WellnessProfileForm />} />
      
      {/* Report Routes */}
      <Route path="reports/joiners-leavers" element={<JoinersLeaversReport />} />
      <Route path="reports/status-changes" element={<StatusChangeReport />} />
    </Routes>
  );
}
