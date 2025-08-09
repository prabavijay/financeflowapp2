import React from 'react';
import { Link } from 'react-router-dom';

const SidebarGroup = ({ groupKey, group, isSelected, hasActiveItem, onClick }) => {
  const baseClasses = 'group relative w-full h-12 flex items-center px-3 my-1 rounded-md transition-all duration-200 border bg-transparent !bg-transparent hover:!bg-transparent focus:!bg-transparent active:!bg-transparent';
  const stateClasses = (isSelected || hasActiveItem)
    ? 'text-emerald-400 border-emerald-500/70'
    : 'text-gray-400 border-transparent hover:text-emerald-400 hover:border-emerald-500/50';

  const className = `${baseClasses} ${stateClasses}`;

  return (
    <div className="my-1">
      <button
        onClick={() => onClick(groupKey)}
        className={className}
        title={group.title}
        style={{ background: 'transparent' }}
      >
        <group.icon className="w-5 h-5" />
        {hasActiveItem && !isSelected && (
          <div className="absolute right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-2 ring-emerald-400/40" />
        )}
      </button>
    </div>
  );
};

export default SidebarGroup;
