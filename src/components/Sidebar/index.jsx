import React from 'react';
import NavItem from './NavItem';
import SidebarGroup from './SidebarGroup';
import ThemeToggle from '../ThemeToggle';

const Sidebar = ({ 
  navigationGroups, 
  selectedGroup, 
  onGroupSelect, 
  bottomNavigation,
  pathname 
}) => {
  return (
    <aside className="ff-sidebar w-20 flex flex-col fixed left-0 top-0 bottom-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-gray-800/50 shadow-xl z-50">
      {/* Logo */}
      <div className="p-3 flex items-center justify-center mb-2">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
          <span className="text-white font-bold text-lg">F</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {Object.entries(navigationGroups).map(([groupKey, group]) => {
          const hasActiveItem = group.items.some(item => pathname === item.href);
          const isSelected = selectedGroup === groupKey;

          return (
            <SidebarGroup
              key={groupKey}
              groupKey={groupKey}
              group={group}
              isSelected={isSelected}
              hasActiveItem={hasActiveItem}
              onClick={onGroupSelect}
            />
          );
        })}

        {/* Bottom Navigation */}
        <div className="pt-4 mt-4 border-t border-gray-800/50">
          {bottomNavigation.map((item) => (
            <NavItem
              key={item.name}
              icon={item.icon}
              title={item.name}
              isActive={pathname === item.href}
              onClick={() => {}}
              href={item.href}
            />
          ))}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-gray-800/50 bg-gradient-to-t from-gray-800/50 to-transparent">
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
