import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../../context/AdminContext';
import { Button, Input, Card } from '../../components/common';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated, loading } = useAdmin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return null;
  }

  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await adminLogin(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || t('admin.login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <Card.Body className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.login.title')}</h1>
            <p className="text-gray-500 mt-2">{t('admin.login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label={t('admin.login.username')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('admin.login.enterUsername')}
              className="mb-4"
              required
            />

            <Input
              label={t('admin.login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin.login.enterPassword')}
              className="mb-6"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={!username || !password}
            >
              {t('admin.login.loginButton')}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
