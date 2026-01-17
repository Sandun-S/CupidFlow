export default function Privacy() {
    return (
        <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="mb-4 text-gray-600">Last Updated: January 17, 2026</p>

            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Account information (Name, Email, Date of Birth).</li>
                    <li>Profile information (Photos, Interests, Bio).</li>
                    <li>Verification data (NIC images - stored securely and used only for verification).</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Provide, maintain, and improve our services.</li>
                    <li>Match you with other users.</li>
                    <li>Verify your identity and prevent fraud.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
                <p>We do not sell your personal data. We may share data with:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Service providers who assist in our operations (e.g., Cloudinary for image hosting, Firebase for data storage).</li>
                    <li>Law enforcement if required by law.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Security</h2>
                <p>We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at support@cupidflow.lk.</p>
            </section>
        </div>
    );
}
