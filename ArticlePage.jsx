import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BlockRenderer from '../components/BlockRenderer';
import { fetchPublishedPage } from '../utils/api';

export default function ArticlePage() {
  const { slug = 'home' } = useParams();
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchPublishedPage(slug)
      .then((data) => {
        if (cancelled) return;
        setPage(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.response?.status === 404 ? 'not-found' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (status === 'not-found') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="text-gray-500 mt-2 text-sm">
          This page doesn't exist yet, or hasn't been published from the CMS.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-gray-500 mt-2 text-sm">Couldn't reach the content API. Please try again shortly.</p>
      </div>
    );
  }

  return (
    <article>
      <BlockRenderer blocks={page.blocks} />
    </article>
  );
}
