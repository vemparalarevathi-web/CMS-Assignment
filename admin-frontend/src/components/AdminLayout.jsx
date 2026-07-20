import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pages', label: 'Pages' }
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((state) => state.auth.admin);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar: stacked on top for mobile, fixed column on desktop -> responsive */}
      <aside className="w-full md:w-64 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col">
        <div className="px-5 py-4 font-semibold text-brand-700 text-lg border-b border-gray-100 md:border-b">
          RenewCred CMS
        </div>
        <nav className="flex md:flex-col flex-1 px-2 py-2 gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block px-4 py-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="mb-2 truncate">{admin?.email || 'admin'}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-600 hover:text-red-700 font-medium"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="md:hidden flex justify-end mb-3">
          <button onClick={handleLogout} className="text-sm text-red-600 font-medium">
            Log out
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
