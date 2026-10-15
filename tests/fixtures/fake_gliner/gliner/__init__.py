"""Stand-in for the gliner package: finds the strings in FAKE_GLINER_ENTITIES ({"text": ["label", score]}).
Like the real model it reads only the first FAKE_GLINER_MAX_WORDS words (counted the same way) and warns
when it cuts. Model names starting with "missing/" fail to load; "crash/" kills the process."""
import json
import os
import re
import warnings

MAX_WORDS = int(os.environ.get('FAKE_GLINER_MAX_WORDS', '384'))
# GLiNER's word pattern (gliner.data_processing.tokenizer.WhitespaceTokenSplitter):
#   \w+(?:[-_]\w+)* a word, possibly joined by "-" or "_";  |\S  or any other single non-space character
WORD = re.compile(r'\w+(?:[-_]\w+)*|\S')


class GLiNER:
    @classmethod
    def from_pretrained(cls, name):
        if name.startswith('missing/'):
            raise OSError(f'{name} is not a local folder and is not a valid model identifier')
        if name.startswith('crash/'):
            os._exit(9)
        print(f'Loading {name}... (libraries sometimes print to stdout)')
        return cls()

    def predict_entities(self, text, labels, threshold=0.5):
        words = list(WORD.finditer(text))
        visible = text
        if len(words) > MAX_WORDS:
            warnings.warn(f'Sentence of length {len(words)} has been truncated to {MAX_WORDS}', UserWarning)
            visible = text[:words[MAX_WORDS - 1].end()]
        found = []
        for value, (label, score) in json.loads(os.environ.get('FAKE_GLINER_ENTITIES', '{}')).items():
            if label not in labels or score < threshold:
                continue
            for m in re.finditer(re.escape(value), visible):
                found.append({'start': m.start(), 'end': m.end(), 'text': value, 'label': label, 'score': score})
        return found
