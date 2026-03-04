// Mock Email Service

export const sendEmail = async (to, subject, body, type = 'notification') => {
    console.log(`
    ---------------------------------------------------
    [MOCK EMAIL SERVICE]
    To: ${to}
    Subject: ${subject}
    Type: ${type}
    Time: ${new Date().toISOString()}
    ---------------------------------------------------
    Body:
    ${body}
    ---------------------------------------------------
  `);

    // Simulate network delay
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const emailTemplates = {
    caretakerApplicationReceived: (name) => ({
        subject: 'Application Received - CarePlatform',
        body: `Hi ${name},\n\nWe have received your application to join CarePlatform. Our team will review your details and get back to you shortly.\n\nBest,\nThe CarePlatform Team`
    }),
    mentorRequestReceived: (name, patientName) => ({
        subject: 'Access Request Received - CarePlatform',
        body: `Hi ${name},\n\nWe have received your request to access medical records for ${patientName}. The care manager will review this request for approval.\n\nBest,\nThe CarePlatform Team`
    }),
    welcomePatient: (name, tempPassword) => ({
        subject: 'Welcome to CarePlatform',
        body: `Hi ${name},\n\nYour account has been created. You can log in using your email and the following temporary password:\n\n${tempPassword}\n\nPlease change your password upon first login.\n\nBest,\nThe CarePlatform Team`
    })
};
