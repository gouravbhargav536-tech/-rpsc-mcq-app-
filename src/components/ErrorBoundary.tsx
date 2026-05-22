import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home, Clipboard, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught RPSC exam applet error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    localStorage.removeItem('rpsc_current_quiz');
    window.location.reload();
  };

  private handleGoHome = () => {
    localStorage.removeItem('rpsc_current_quiz');
    localStorage.removeItem('rpsc_user');
    window.location.href = '/';
  };

  private copyToClipboard = () => {
    const textToCopy = `${this.state.error?.toString()}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(err => {
      console.error("Clipboard copy failed", err);
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient indicator lights */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 text-rose-500 shadow-inner">
                <AlertCircle size={32} className="animate-bounce" />
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
                CBT Portal Recovery
              </span>

              <h1 className="text-2xl font-black tracking-tight text-white mb-3">
                Exam Session Interrupted
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-sm">
                The RPSC AI CBT layout system encountered an isolated rendering error. Your account profile is safe. You can restart the exam simulator instantly.
              </p>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <button
                  id="error-reset-btn"
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-[0.98] transition-all text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-rose-900/30"
                >
                  <RotateCcw size={16} />
                  Restart Exam
                </button>

                <button
                  id="error-home-btn"
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 active:scale-[0.98] transition-all text-slate-200 font-semibold py-3 px-4 rounded-xl text-sm border border-slate-600/50"
                >
                  <Home size={16} />
                  Main Screen
                </button>
              </div>

              {/* Error log details */}
              <div className="w-full text-left bg-slate-950/80 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Diagnostic Trace
                  </span>
                  <button
                    onClick={this.copyToClipboard}
                    className="flex items-center gap-1 text-[11px] font-mono hover:text-white transition-colors text-slate-400"
                    title="Copy trace to clipboard"
                  >
                    {this.state.copied ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard size={12} />
                        <span>Copy Path</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-24 overflow-y-auto font-mono text-xs text-rose-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 break-all select-all">
                  {this.state.error ? this.state.error.toString() : "Unknown boundary component fault"}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
