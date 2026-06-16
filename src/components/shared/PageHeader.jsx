import React from 'react';
import { ChevronRight } from 'lucide-react';

function PageHeader({ title, subtitle, breadcrumbs = [], actions = [] }) {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-rajdhani text-gray-400">Dashboard</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="text-gray-600" />
              <span className={`text-sm font-rajdhani ${index === breadcrumbs.length - 1 ? 'text-cyber-green' : 'text-gray-400'}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-cyber-green">{title}</h1>
          {subtitle && (
            <p className="text-gray-400 font-rajdhani mt-1">{subtitle}</p>
          )}
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors flex items-center gap-2 ${
                  action.variant === 'primary'
                    ? 'bg-cyber-green text-cyber-dark hover:bg-cyber-green/90'
                    : action.variant === 'danger'
                    ? 'bg-cyber-red/20 text-cyber-red hover:bg-cyber-red/30'
                    : 'bg-cyber-border text-gray-300 hover:bg-cyber-border/70'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
