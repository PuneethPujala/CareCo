import React, { createContext, useContext, useState } from 'react';

const OrganizationContext = createContext(null);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([
    {
      id: 'org-1',
      name: 'ABC Healthcare',
      type: 'hospital',
      status: 'active',
      subscription: 'enterprise',
      doctors_count: 45,
      patients_count: 1234
    },
    {
      id: 'org-2', 
      name: 'XYZ Medical Center',
      type: 'clinic',
      status: 'active',
      subscription: 'professional',
      doctors_count: 12,
      patients_count: 890
    }
  ]);

  const [currentOrganization, setCurrentOrganization] = useState(null);

  const addOrganization = (orgData) => {
    const newOrg = {
      id: `org-${Date.now()}`,
      status: 'active',
      ...orgData
    };
    setOrganizations([...organizations, newOrg]);
    return newOrg;
  };

  const updateOrganization = (id, updates) => {
    setOrganizations(organizations.map(org => 
      org.id === id ? { ...org, ...updates } : org
    ));
  };

  const deleteOrganization = (id) => {
    setOrganizations(organizations.filter(org => org.id !== id));
  };

  const getOrganization = (id) => {
    return organizations.find(org => org.id === id);
  };

  return (
    <OrganizationContext.Provider value={{
      organizations,
      currentOrganization,
      setCurrentOrganization,
      addOrganization,
      updateOrganization,
      deleteOrganization,
      getOrganization
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};
