export interface ISpeechService {
  /**
   * Reads the Tamil couplet aloud using browser SpeechSynthesis.
   */
  speak(text: string): Promise<void>;

  /**
   * Stops any currently playing speech synthesis audio.
   */
  stop(): void;

  /**
   * Returns true if SpeechSynthesis is supported by user's browser.
   */
  isSupported(): boolean;

  /**
   * Returns true if speech is currently playing.
   */
  isSpeaking(): boolean;
}
