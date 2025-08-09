import React from 'react';
import { Link } from 'react-router-dom';

const NavItem = ({ icon: Icon, title, isActive, isSelected, onClick, hasNotification, href }) => {
  // ensure no fills at all
  const baseClasses = `group relative w-full h-12 flex items-center px-3 my-1 rounded-md transition-all duration-200 border bg-transparent !bg-transparent hover:!bg-transparent focus:!bg-transparent active:!bg-transparent`;
  const stateClasses = (isActive || isSelected)
    ? 'text-emerald-400 border-emerald-500/70'
    : 'text-gray-400 border-transparent hover:text-emerald-400 hover:border-emerald-500/50';

  const className = `${baseClasses} ${stateClasses}`;

  // Render a link if href is provided, else render a button
  if (href) {
    return (
      <Link to={href} className={className} title={title} style={{ background: 'transparent' }}>
        <Icon className="w-5 h-5" />
        {hasNotification && !isSelected && (
          <div className="absolute right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-2 ring-emerald-400/40" />
        )}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title} style={{ background: 'transparent' }}>
      <Icon className="w-5 h-5" />
      {hasNotification && !isSelected && (
        <div className="absolute right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-2 ring-emerald-400/40" />
      )}
    </button>
  );
};

export default NavItem;
