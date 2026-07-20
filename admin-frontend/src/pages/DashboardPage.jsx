import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPages } from '../store/slices/pagesSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.pages);
  const admin = useSelector((state) => state.auth.admin);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  const published = list.filter((p) => p.status === 'published').length;
  const drafts = list.filter((p) => p.status === 'draft').length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Welcome{admin?.username ? `, ${admin.username}` : ''}</h1>
      <p className="text-gray-500 mt-1 text-sm">Here's an overview of your site content.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Total pages" value={list.length} />
        <StatCard label="Published" value={published} accent="text-brand-700" />
        <StatCard label="Drafts" value={drafts} accent="text-amber-600" />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          to="/pages/new"
          className="inline-flex justify-center items-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Create new page
        </Link>
        <Link
          to="/pages"
          className="inline-flex justify-center items-center border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-md"
        >
          Manage all pages
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recently updated</h2>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg divide-y">
            {list.slice(0, 5).map((p) => (
              <Link
                key={p._id}
                to={`/pages/${p._id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-sm"
              >
                <span className="font-medium text-gray-800">{p.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'published' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {p.status}
                </span>
              </Link>
            ))}
            {list.length === 0 && <p className="px-4 py-6 text-sm text-gray-400">No pages yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-gray-900' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}
