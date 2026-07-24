/**
 * Picks a phrase for a feedback key. Stays stable while the key doesn't
 * change (so the message doesn't flicker between phrasings mid-phase at
 * 30fps), but picks a different phrase than last time whenever the key
 * freshly becomes active again — so the same cue doesn't read identically
 * on every single rep.
 */
export class FeedbackPicker<Key extends string> {
  private currentKey: Key | null = null
  private currentPhrase = ''
  private lastPhraseByKey = new Map<Key, string>()

  pick(key: Key, phrases: Record<Key, string[]>): string {
    if (key === this.currentKey) return this.currentPhrase

    const options = phrases[key] ?? []
    if (options.length === 0) {
      this.currentKey = key
      this.currentPhrase = ''
      return ''
    }

    const previous = this.lastPhraseByKey.get(key)
    const choices = options.length > 1 && previous ? options.filter((p) => p !== previous) : options
    const next = choices[Math.floor(Math.random() * choices.length)]

    this.currentKey = key
    this.currentPhrase = next
    this.lastPhraseByKey.set(key, next)
    return next
  }

  reset() {
    this.currentKey = null
    this.currentPhrase = ''
    this.lastPhraseByKey.clear()
  }
}
