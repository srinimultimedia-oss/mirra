import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import sys
sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("reviews", ROOT / ".agents/skills/replica-entrepreneur/reviews.py")
reviews = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(reviews)

class ThemeBounds(unittest.TestCase):
    def load(self, value):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "themes.json"
            file.write_text(json.dumps(value), encoding="utf-8")
            return reviews.load_themes(file)

    def test_default_and_unicode_config(self):
        themes, requests = reviews.load_themes()
        self.assertGreater(len(themes), 0)
        custom, patterns = self.load({"themes": [{"id": "cafe", "label": "Café", "patterns": ["café"]}], "request_patterns": ["please"]})
        self.assertTrue(custom[0]["patterns"][0].search("CAFÉ"))
        self.assertTrue(patterns[0].search("PLEASE"))

    def test_counts_types_and_pattern_lengths_reject(self):
        invalid = [[], {"themes": [None]}, {"themes": [{"id": "x"}] * 101}, {"request_patterns": ["x"] * 101}, {"request_patterns": "x"}, {"request_patterns": [12]}, {"request_patterns": ["x" * 513]}, {"request_patterns": ["("]}, {"themes": [{"id": "x", "patterns": ["x"] * 100}] * 11}]
        for value in invalid:
            with self.subTest(value_type=type(value).__name__), self.assertRaises(reviews.FeedbackError):
                self.load(value)

    def test_file_size_rejects_before_json_decode(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "themes.json"
            file.write_bytes(b" " * (reviews.MAX_THEME_BYTES + 1))
            with self.assertRaisesRegex(reviews.FeedbackError, "size limit"):
                reviews.load_themes(file)

if __name__ == "__main__":
    unittest.main()
