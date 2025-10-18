import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this would send to a backend
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="min-h-screen bg-black text-white py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
        <p className="text-white/60 text-xl mb-16">
          Have questions or feedback? We'd love to hear from you!
        </p>

        <div className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none"
                  placeholder="Your message..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-4 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Send Message
              </button>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✓</div>
              <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              <p className="text-white/70 text-lg mb-8">
                Your message has been received. We'll get back to you soon.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', message: '' });
                }}
                className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="rounded-xl border border-white/10 p-6 bg-white/5">
            <div className="text-3xl mb-2">📧</div>
            <div className="text-sm text-white/60">Email</div>
            <div className="text-white/80 text-sm mt-1">info@bsre.space</div>
          </div>
          <div className="rounded-xl border border-white/10 p-6 bg-white/5">
            <div className="text-3xl mb-2">🌐</div>
            <div className="text-sm text-white/60">Website</div>
            <div className="text-white/80 text-sm mt-1">bsre.space</div>
          </div>
          <div className="rounded-xl border border-white/10 p-6 bg-white/5">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-sm text-white/60">Event</div>
            <div className="text-white/80 text-sm mt-1">NASA Space Apps 2024</div>
          </div>
        </div>
      </div>
    </main>
  );
}
