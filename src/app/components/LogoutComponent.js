import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  // Logout logic
  const { dispatch } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    document.cookie = 'token=; max-age=0';
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 bg-white hover:bg-red-100 font-bold py-2 px-4 rounded shadow"
    >
      Logout
    </button>
  );
}

export default LogoutButton;

