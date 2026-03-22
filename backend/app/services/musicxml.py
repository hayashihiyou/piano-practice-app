from __future__ import annotations

from collections import defaultdict
from xml.etree import ElementTree as ET

from ..schemas import CanonicalMeasure, CanonicalNote, CanonicalScore, TempoChange


STEP_TO_SEMITONE = {
  "C": 0,
  "D": 2,
  "E": 4,
  "F": 5,
  "G": 7,
  "A": 9,
  "B": 11,
}

SOLFEGE_MAP = {
  "C": "\u30c9",
  "D": "\u30ec",
  "E": "\u30df",
  "F": "\u30d5\u30a1",
  "G": "\u30bd",
  "A": "\u30e9",
  "B": "\u30b7",
}


def local_name(tag: str) -> str:
  if "}" in tag:
    return tag.split("}", 1)[1]
  return tag


def find_child_text(node: ET.Element, child_name: str, default: str = "") -> str:
  for child in node:
    if local_name(child.tag) == child_name:
      return (child.text or default).strip()
  return default


def iter_children(node: ET.Element, name: str) -> list[ET.Element]:
  return [child for child in list(node) if local_name(child.tag) == name]


def pitch_to_midi(step: str, alter: int, octave: int) -> int:
  if step not in STEP_TO_SEMITONE:
    raise ValueError(f"Unsupported step {step}")
  return 12 * (octave + 1) + STEP_TO_SEMITONE[step] + alter


def midi_to_note_name(midi: int) -> str:
  note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  octave = (midi // 12) - 1
  return f"{note_names[midi % 12]}{octave}"


def step_to_solfege(step: str) -> str:
  return SOLFEGE_MAP.get(step, step)


def beats_to_ms(beats: float, tempo: float) -> float:
  return (beats * 60000.0) / tempo


def normalize_tempo_changes(changes: list[TempoChange]) -> list[TempoChange]:
  normalized: list[TempoChange] = []
  for change in sorted(changes, key=lambda entry: entry.beatTime):
    if normalized and normalized[-1].beatTime == change.beatTime:
      normalized[-1] = change
      continue
    normalized.append(change)
  return normalized


def beat_position_to_ms(beat_time: float, tempo_changes: list[TempoChange]) -> float:
  elapsed_ms = 0.0
  for index, current in enumerate(tempo_changes):
    next_change = tempo_changes[index + 1] if index + 1 < len(tempo_changes) else None
    segment_end = min(next_change.beatTime, beat_time) if next_change else beat_time
    if segment_end <= current.beatTime:
      continue
    elapsed_ms += beats_to_ms(segment_end - current.beatTime, current.tempo)
    if not next_change or beat_time <= next_change.beatTime:
      break
  return elapsed_ms


def beat_span_to_ms(start_beat: float, beat_length: float, tempo_changes: list[TempoChange]) -> float:
  return beat_position_to_ms(start_beat + beat_length, tempo_changes) - beat_position_to_ms(start_beat, tempo_changes)


def parse_musicxml(xml_text: str, score_id: str, source_type: str, fallback_title: str) -> CanonicalScore:
  root = ET.fromstring(xml_text)

  title = fallback_title
  work = next((child for child in list(root) if local_name(child.tag) == "work"), None)
  if work is not None:
    title = find_child_text(work, "work-title", fallback_title) or fallback_title
  if title == fallback_title:
    title = find_child_text(root, "movement-title", fallback_title) or fallback_title

  part = next((child for child in list(root) if local_name(child.tag) == "part"), None)
  if part is None:
    raise ValueError("MusicXML part not found")

  divisions = 1
  current_dynamic = "mf"
  cursor_beat = 0.0
  tempo_changes = [TempoChange(beatTime=0, tempo=80)]
  notes_by_measure: dict[int, list[CanonicalNote]] = defaultdict(list)
  note_index = 0

  for measure_position, measure_node in enumerate(iter_children(part, "measure"), start=1):
    measure_number = int(measure_node.attrib.get("number", measure_position))
    measure_cursor = cursor_beat
    measure_max_beat = cursor_beat
    last_note_start = measure_cursor

    for child in list(measure_node):
      tag = local_name(child.tag)
      if tag == "attributes":
        next_divisions = find_child_text(child, "divisions")
        if next_divisions:
          divisions = int(next_divisions)
        continue

      if tag == "direction":
        sound_node = next((node for node in child.iter() if local_name(node.tag) == "sound" and "tempo" in node.attrib), None)
        if sound_node is not None:
          tempo_changes.append(
            TempoChange(beatTime=measure_cursor, tempo=float(sound_node.attrib["tempo"])),
          )

        dynamics_parent = next((node for node in child.iter() if local_name(node.tag) == "dynamics"), None)
        if dynamics_parent is not None and list(dynamics_parent):
          current_dynamic = local_name(list(dynamics_parent)[0].tag).lower()
        continue

      if tag in {"backup", "forward"}:
        duration = int(find_child_text(child, "duration", "0") or "0")
        beat_length = duration / divisions if divisions else 0
        measure_cursor += -beat_length if tag == "backup" else beat_length
        continue

      if tag != "note":
        continue

      is_rest = any(local_name(node.tag) == "rest" for node in list(child))
      is_chord = any(local_name(node.tag) == "chord" for node in list(child))
      duration = int(find_child_text(child, "duration", "0") or "0")
      beat_length = duration / divisions if divisions else 0
      voice = find_child_text(child, "voice", "1") or "1"
      note_start = last_note_start if is_chord else measure_cursor

      if is_rest:
        measure_cursor += beat_length
        measure_max_beat = max(measure_max_beat, measure_cursor)
        continue

      pitch_node = next((node for node in list(child) if local_name(node.tag) == "pitch"), None)
      if pitch_node is None:
        continue

      step = find_child_text(pitch_node, "step", "C")
      alter = int(find_child_text(pitch_node, "alter", "0") or "0")
      octave = int(find_child_text(pitch_node, "octave", "4") or "4")
      midi = pitch_to_midi(step, alter, octave)
      note_name = midi_to_note_name(midi)

      note = CanonicalNote(
        id=f"{measure_number}-{voice}-{note_index}",
        midi=midi,
        noteName=note_name,
        solfege=step_to_solfege(step),
        beatTime=note_start,
        beatLength=beat_length,
        voice=voice,
        dynamic=current_dynamic,
      )
      notes_by_measure[measure_number].append(note)
      note_index += 1

      if not is_chord:
        last_note_start = note_start
        measure_cursor += beat_length
        measure_max_beat = max(measure_max_beat, measure_cursor)

    cursor_beat = measure_max_beat

  normalized_tempo = normalize_tempo_changes(tempo_changes)
  measures: list[CanonicalMeasure] = []
  for number in sorted(notes_by_measure):
    measure_notes = []
    for note in notes_by_measure[number]:
      note.expectedMsFromStart = beat_position_to_ms(note.beatTime, normalized_tempo)
      note.expectedDurationMs = beat_span_to_ms(note.beatTime, note.beatLength, normalized_tempo)
      measure_notes.append(note)
    measures.append(CanonicalMeasure(number=number, notes=measure_notes))

  base_tempo = normalized_tempo[0].tempo if normalized_tempo else 80
  return CanonicalScore(
    id=score_id,
    title=title,
    sourceType=source_type,
    baseTempo=base_tempo,
    tempoMap=normalized_tempo,
    measures=measures,
  )
