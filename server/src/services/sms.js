// SMS Service - supports mock mode for development and Twilio for production

// Static test code for mock mode
const MOCK_TEST_CODE = '123456';

export const generateVerificationCode = () => {
  // In mock mode, always return the static test code
  const mockMode = process.env.SMS_MOCK_MODE;
  const isMockMode = mockMode === 'true' || mockMode === true || !process.env.TWILIO_ACCOUNT_SID;

  if (isMockMode) {
    return MOCK_TEST_CODE;
  }

  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMS = async (phoneNumber, message) => {
  // Check mock mode - be defensive about the check
  const mockMode = process.env.SMS_MOCK_MODE;
  const isMockMode = mockMode === 'true' || mockMode === true || !process.env.TWILIO_ACCOUNT_SID;

  console.log('SMS Service - Mock Mode:', isMockMode, '| SMS_MOCK_MODE env:', mockMode);

  if (isMockMode) {
    console.log('========================================');
    console.log('SMS MOCK MODE - Message not actually sent');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('========================================');
    return { success: true, mock: true };
  }

  // Twilio integration - only runs if mock mode is false
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    console.log('Twilio credentials missing, falling back to mock mode');
    console.log(`Mock SMS to ${phoneNumber}: ${message}`);
    return { success: true, mock: true };
  }

  try {
    // Dynamic import for Twilio
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phoneNumber
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    const smsError = new Error(`Failed to send SMS: ${error.message}`);
    smsError.originalError = error;
    throw smsError;
  }
};

export const sendVerificationCode = async (phoneNumber, code) => {
  const message = `VEDZEB: თქვენი დადასტურების კოდია: ${code}. კოდი მოქმედებს 10 წუთის განმავლობაში.`;
  return sendSMS(phoneNumber, message);
};
