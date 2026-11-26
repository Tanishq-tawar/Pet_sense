import { Link } from 'react-router-dom'
import { Stethoscope, Shield, Camera, BarChart3, Bell, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'

const FEATURES = [
  { icon: Camera, title: 'Photo & Video Upload', desc: 'Upload images and short videos of your dog for visual review.' },
  { icon: Stethoscope, title: 'Preliminary Observations', desc: 'AI-assisted observation of coat, eyes, ears, and body condition.' },
  { icon: BarChart3, title: 'Health History', desc: 'Track observations over time with visual timeline and charts.' },
  { icon: Bell, title: 'Reminders', desc: 'Stay on schedule for vaccinations, vet visits, and checkups.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your pet\'s data stays private — stored securely, accessible only to you.' },
]

const STEPS = [
  { step: '01', title: 'Create a pet profile', desc: 'Add your dog\'s details including breed, age, and medical history.' },
  { step: '02', title: 'Upload media', desc: 'Upload a photo or short video of your dog for analysis.' },
  { step: '03', title: 'Review observations', desc: 'Read the preliminary observation report with breed-specific notes.' },
  { step: '04', title: 'Follow up with your vet', desc: 'Share observations with your veterinarian for professional evaluation.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">Pet Sense</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-800 transition">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          AI-Powered Pet Health Monitoring
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Monitor your dog's health<br className="hidden md:block" />
          <span className="text-teal-600"> with AI-assisted observations</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Upload photos and videos of your dog. Pet Sense reviews them for visible signs that
          may warrant veterinary attention — clearly labelled as preliminary observations, not diagnoses.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary text-base py-3 px-6">
            Start monitoring free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base py-3 px-6">
            Sign in
          </Link>
        </div>

        {/* Supported breeds */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {['Labrador Retriever', 'German Shepherd'].map(breed => (
            <span key={breed} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-full">
              <CheckCircle size={14} className="text-teal-600" /> {breed}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 text-sm rounded-full">
            + More breeds coming soon
          </span>
        </div>
      </section>

      {/* Disclaimer banner */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">Important health notice</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Pet Sense provides <strong>preliminary visual observations</strong> for health monitoring and early wellness tracking.
              It does not replace professional veterinary diagnostics or clinical examinations.
              Always consult a qualified veterinarian for any health concerns or before starting treatments.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">Everything you need</h2>
          <p className="text-slate-500 text-center mb-12">A complete health monitoring companion for your dog.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">How it works</h2>
        <p className="text-slate-500 text-center mb-12">Four simple steps to start monitoring.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-sm">{step}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start monitoring your dog's health today</h2>
          <p className="text-teal-100 mb-8">Free to use. No credit card required.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition text-base">
            Get started — it's free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
              <Stethoscope size={13} className="text-white" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Pet Sense</span>
          </div>
          <p className="text-slate-400 text-xs text-center">
            © 2024 Pet Sense. For informational purposes only. Not a substitute for veterinary care.
          </p>
        </div>
      </footer>
    </div>
  )
}
