import { Globe, Zap, Shield, Wand2, FolderOpen } from "lucide-react";
import { WebCloneForm } from "@/components/web-clone-form";
import { ProgressMonitor } from "@/components/progress-monitor";
import { SuccessDownload } from "@/components/success-download";
import { useState } from "react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'form' | 'progress' | 'success'>('form');
  const [jobId, setJobId] = useState<string | null>(null);

  const handleCloneStart = (id: string) => {
    setJobId(id);
    setCurrentStep('progress');
  };

  const handleCloneComplete = () => {
    setCurrentStep('success');
  };

  const handleNewClone = () => {
    setCurrentStep('form');
    setJobId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-slate-900 to-slate-800 text-white font-inter">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse-soft"></div>
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-float">
                <FolderOpen className="text-white w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                WebClone Pro
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Pricing</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Support</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Clone Any Website
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced web cloning tool that captures complete websites including HTML, CSS, JavaScript, images, fonts, and all linked resources. Download everything as an organized ZIP file.
          </p>
        </div>

        {/* Main Cloning Interface */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'form' && (
            <WebCloneForm onCloneStart={handleCloneStart} />
          )}
          
          {currentStep === 'progress' && jobId && (
            <ProgressMonitor jobId={jobId} onComplete={handleCloneComplete} />
          )}
          
          {currentStep === 'success' && jobId && (
            <SuccessDownload jobId={jobId} onNewClone={handleNewClone} />
          )}

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card-bg/30 glass-effect rounded-2xl p-6 border border-slate-600 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400">Parallel downloading and advanced algorithms ensure maximum speed for website cloning.</p>
            </div>

            <div className="bg-card-bg/30 glass-effect rounded-2xl p-6 border border-slate-600 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-success rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Complete & Secure</h3>
              <p className="text-gray-400">Captures all resources while maintaining security and respecting robots.txt files.</p>
            </div>

            <div className="bg-card-bg/30 glass-effect rounded-2xl p-6 border border-slate-600 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Wand2 className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Processing</h3>
              <p className="text-gray-400">Intelligent path conversion and resource optimization for offline functionality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <FolderOpen className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-semibold text-white">WebClone Pro</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 WebClone Pro. Advanced website cloning technology.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
