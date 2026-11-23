# Trivia live-screen sound: credits and licences

All trivia sounds are **synthesised in the browser** by
`apps/web/src/helpers/triviaSound.ts` (WebAudio oscillators, filters and a
generated white-noise buffer). There are no audio files, samples or third-party
recordings in the repo or loaded at runtime.

| Sound | Where it plays | Source | Licence |
|---|---|---|---|
| Lobby loop (C–G–Am–F, 104 bpm: pad, plucked arpeggio, bass, soft kick and shaker) | Live screen, lobby phase | Self-generated, `TriviaSoundEngine.startLobby()` | Original work by SnapShare, CC0 1.0 |
| Countdown tick (normal + urgent for the last 5 s) | Live screen, last 10 s of a question | Self-generated, `tick()` | Original work by SnapShare, CC0 1.0 |
| Reveal sting (noise riser into a major-chord stab) | Live screen, when the host reveals | Self-generated, `reveal()` | Original work by SnapShare, CC0 1.0 |
| Podium fanfare (brass-style melody, timpani roll, cymbal) | Live screen, podium | Self-generated, `fanfare()` | Original work by SnapShare, CC0 1.0 |
| Chord progression / melody | — | Generic I–V–vi–IV progression and an arpeggiated major triad fanfare; common musical building blocks, not taken from any song | — |

Emoji in the reactions (❤️ 🎉 😂 👏 🥂) are rendered with the device's system emoji
font; no emoji image set is bundled.

If recorded assets are ever added, put them under `apps/web/public/trivia/sound/`
and add a row here with the exact source URL and licence (CC0 or similar only).
