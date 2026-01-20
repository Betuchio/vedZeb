import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea, Card } from '../components/common';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container-page">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('contact.title')}</h1>

        <Card>
          <Card.Body className="p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Thank you!
                </h2>
                <p className="text-gray-600">
                  Your message has been received. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('contact.form.name')}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />

                <Input
                  label={t('contact.form.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />

                <Textarea
                  label={t('contact.form.message')}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={5}
                  required
                />

                <Button type="submit" className="w-full">
                  {t('contact.form.send')}
                </Button>
              </form>
            )}
          </Card.Body>
        </Card>

        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            <strong>Email:</strong> contact@vedzeb.ge
          </p>
        </div>
      </div>
    </div>
  );
}
