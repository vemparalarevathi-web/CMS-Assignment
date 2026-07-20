import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPages, deletePage } from '../store/slices/pagesSlice';

export default function PagesListPage() {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      dispatch(deletePage(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pages</h1>
        <Link
          to="/pages/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + New page
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">/{p.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'published' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link to={`/pages/${p._id}`} className="text-brand-700 hover:underline">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(p._id, p.title)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && list.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">No pages yet — create your first one.</p>
        )}
      </div>
    </div>
  );
}
