import React from 'react';

interface DashboardTemplateProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  header,
  sidebar,
  children,
  footer,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {header && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          {sidebar && (
            <aside className="md:w-1/4 pr-0 md:pr-6 mb-6 md:mb-0">
              {sidebar}
            </aside>
          )}
          
          <main className="md:w-3/4">
            {children}
          </main>
        </div>
      </div>
      
      {footer && (
        <footer className="bg-white mt-8">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export default DashboardTemplate;