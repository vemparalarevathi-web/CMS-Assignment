import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import BlockEditor from '../components/BlockEditor';
import { fetchPageById, createPage, updatePage, clearCurrentPage } from '../store/slices/pagesSlice';

export default function PageEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, error } = useSelector((state) => state.pages);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('draft');
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      dispatch(fetchPageById(id));
    }
    return () => dispatch(clearCurrentPage());
  }, [id, isNew, dispatch]);

  useEffect(() => {
    if (current && !isNew) {
      setTitle(current.title);
      setSlug(current.slug);
      setStatus(current.status);
      setBlocks(current.blocks || []);
    }
  }, [current, isNew]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Strip client-only temp ids before sending nested list items etc.
    const payload = { title, slug: slug || undefined, status, blocks };

    const action = isNew ? createPage(payload) : updatePage({ id, payload });
    const result = await dispatch(action);
    setSaving(false);

    if (!result.error) {
      navigate('/pages');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{isNew ? 'Create page' : 'Edit page'}</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
              placeholder="Home"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-gray-400 font-normal">(auto-generated if left blank on create)</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
              placeholder="home"
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Content blocks</h2>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-md"
          >
            {saving ? 'Saving…' : 'Save page'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pages')}
            className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
