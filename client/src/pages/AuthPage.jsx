import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Button, Input, Card, PhoneInput, validatePhoneNumber } from '../components/common';

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    // Validate phone number
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      setPhoneError(t('auth.invalidPhone') || 'არასწორი ტელეფონის ნომერი');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.sendCode(phone);
      setStep('code');
      setCountdown(60);

      if (response.data.code && import.meta.env.DEV) {
        console.log('Development code:', response.data.code);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError('');
    setLoading(true);

    try {
      const response = await authApi.sendCode(phone);
      setCountdown(60);

      if (response.data.code && import.meta.env.DEV) {
        console.log('Development code:', response.data.code);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <Card.Body className="p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t('auth.title')}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendCode}>
              <PhoneInput
                label={t('auth.phoneLabel')}
                value={phone}
                onChange={setPhone}
                error={phoneError}
                className="mb-6"
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!phone}
              >
                {t('auth.sendCode')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="mb-4 text-sm text-gray-600 text-center">
                <span>{t('auth.phoneLabel')}: </span>
                <span className="font-medium">{phone}</span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="ml-2 text-primary-600 hover:underline"
                >
                  {t('common.edit')}
                </button>
              </div>

              <Input
                label={t('auth.codeLabel')}
                type="text"
                placeholder={t('auth.codePlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mb-6"
                maxLength={6}
              />

              <Button
                type="submit"
                className="w-full mb-4"
                loading={loading}
                disabled={code.length !== 6}
              >
                {t('auth.verify')}
              </Button>

              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <span className="text-gray-500">
                    {t('auth.resendIn')} {countdown} {t('auth.seconds')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-primary-600 hover:underline"
                  >
                    {t('auth.resendCode')}
                  </button>
                )}
              </div>
            </form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
