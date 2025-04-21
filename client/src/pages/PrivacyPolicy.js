import React from 'react';

const PrivacyPolicy = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Last updated: April 1, {currentYear}
        </p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Welcome to MindfulAI. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, and share your personal information when you use our mental health companion application.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Please read this Privacy Policy carefully. If you disagree with our policies and practices, please do not use our application. 
              By accessing or using MindfulAI, you agree to this Privacy Policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              We collect several types of information from and about users of our application, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                <strong>Personal information</strong>: Name, email address, and other personal information you provide when creating an account.
              </li>
              <li>
                <strong>Health information</strong>: Mood entries, journal entries, chat conversations with our AI, and other mental health-related information you provide through the application.
              </li>
              <li>
                <strong>Usage information</strong>: Information about how you use our application, including features you use, time spent on the application, and other usage patterns.
              </li>
              <li>
                <strong>Device information</strong>: Information about the device you use to access our application, including device type, operating system, and browser type.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Provide, maintain, and improve our application and services</li>
              <li>Personalize your experience and deliver content relevant to your mental health needs</li>
              <li>Process and analyze your mood entries and journal entries to provide insights and recommendations</li>
              <li>Train and improve our AI algorithms to better respond to your needs</li>
              <li>Communicate with you about your account, updates to our application, and other relevant information</li>
              <li>Protect the security and integrity of our application</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. How We Share Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              We do not sell or rent your personal information to third parties. We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                <strong>With service providers</strong>: We may share your information with service providers who perform services on our behalf, such as hosting, data analysis, payment processing, and customer service.
              </li>
              <li>
                <strong>With your consent</strong>: We may share your information when you have given us your consent to do so, such as when you choose to share your progress with a healthcare professional.
              </li>
              <li>
                <strong>For research purposes</strong>: If you opt-in, we may use your anonymized data for research purposes to improve mental health services and understanding.
              </li>
              <li>
                <strong>For legal reasons</strong>: We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </li>
              <li>
                <strong>Emergency situations</strong>: In the event that we believe you or someone else is in immediate danger, we may disclose information to relevant authorities.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              We implement appropriate technical and organizational safeguards to protect your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. These measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Encryption of sensitive data</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage practices</li>
              <li>Regular backups of data</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights and Choices</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              You have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                <strong>Access</strong>: You can request access to your personal information we hold.
              </li>
              <li>
                <strong>Correction</strong>: You can request that we correct inaccurate or incomplete information.
              </li>
              <li>
                <strong>Deletion</strong>: You can request that we delete your personal information.
              </li>
              <li>
                <strong>Restriction</strong>: You can request that we restrict the processing of your personal information.
              </li>
              <li>
                <strong>Data portability</strong>: You can request a copy of your personal information in a structured, commonly used, and machine-readable format.
              </li>
              <li>
                <strong>Opt-out</strong>: You can opt-out of certain uses of your information, such as research purposes.
              </li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              You can exercise these rights by accessing your account settings or contacting us directly.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our application is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe we may have collected information from your child, please contact us so that we can delete the information.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date. We will notify you of any changes by posting the new Privacy Policy on this page and, if the changes are significant, we will provide a more prominent notice.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              <br /><br />
              <strong>Email</strong>: privacy@mindfulai.com<br />
              <strong>Address</strong>: 123 Mental Health Street, Wellness City, MC 12345<br />
              <strong>Phone</strong>: (555) 123-4567
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              MindfulAI is not a substitute for professional mental health care. It is designed to provide support and tools for mental well-being, but it should not be used to diagnose or treat any medical condition. If you are experiencing a mental health crisis or emergency, please contact emergency services or a mental health professional immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 