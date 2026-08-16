import { ISpeechService } from './interfaces/speech-service.interface';

export class WebSpeechService implements ISpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  isSpeaking(): boolean {
    return this.synth !== null && (this.synth.speaking || this.currentUtterance !== null);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported on this browser/platform.');
      return;
    }

    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Find Tamil voice if available
      const voices = this.synth!.getVoices();
      const tamilVoice = voices.find(
        (v) => v.lang === 'ta-IN' || v.lang === 'ta_IN' || v.lang.startsWith('ta')
      );

      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
      utterance.lang = 'ta-IN';
      utterance.rate = 0.9; // Slightly slower for classical Tamil couplet cadence
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (err) => {
        this.currentUtterance = null;
        reject(err);
      };

      this.synth!.speak(utterance);
    });
  }
}
