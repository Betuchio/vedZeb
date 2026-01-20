// SMS Service - supports mock mode for development and Twilio for production

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMS = async (phoneNumber, message) => {
  const isMockMode = process.env.SMS_MOCK_MODE === 'true';

  if (isMockMode) {
    console.log('========================================');
    console.log('SMS MOCK MODE - Message not actually sent');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('========================================');
    return { success: true, mock: true };
  }

  // Twilio integration
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }

    // Dynamic import for Twilio (optional dependency)
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
  const message = `VedZeb: თქვენი დადასტურების კოდია: ${code}. კოდი მოქმედებს 10 წუთის განმავლობაში.`;
  return sendSMS(phoneNumber, message);
};
