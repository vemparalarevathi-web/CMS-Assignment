import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-brand-700">
          RenewCred
        </Link>
      </div>
    </header>
  );
}
