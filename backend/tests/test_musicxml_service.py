from pathlib import Path

from backend.app.config import ROOT_DIR
from backend.app.services.musicxml import parse_musicxml


def test_parse_musicxml_extracts_measures_and_solfege() -> None:
  sample_path = ROOT_DIR / "samples" / "twinkle.musicxml"
  xml_text = Path(sample_path).read_text(encoding="utf-8")

  score = parse_musicxml(xml_text, score_id="score-test", source_type="musicxml", fallback_title="Fallback")

  assert score.title == "Twinkle MVP"
  assert score.baseTempo == 88
  assert len(score.measures) == 4
  assert [note.solfege for note in score.measures[0].notes] == ["\u30c9", "\u30c9", "\u30bd", "\u30bd"]
  assert score.measures[1].notes[0].noteName == "A4"
