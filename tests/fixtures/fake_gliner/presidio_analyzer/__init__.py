"""Stand-in for presidio_analyzer: finds the strings in FAKE_PRESIDIO_ENTITIES ({"text": ["TYPE", score]}).
Each type is reported by a recognizer for that type, so a removed recognizer finds nothing. analyze() fails
for a language the engine was not created for, as Presidio does."""
import json
import os
import re

RECOGNIZERS = {'EmailRecognizer': ['EMAIL_ADDRESS'], 'UrlRecognizer': ['URL'], 'PhoneRecognizer': ['PHONE_NUMBER'],
               'SpacyRecognizer': ['PERSON', 'LOCATION', 'ORGANIZATION', 'DATE_TIME', 'EMAIL']}


class Recognizer:
    def __init__(self, name, entities):
        self.name = name
        self.supported_entities = entities


class Registry:
    def __init__(self):
        self.recognizers = [Recognizer(name, entities) for name, entities in RECOGNIZERS.items()]


class RecognizerResult:
    def __init__(self, entity_type, start, end, score):
        self.entity_type, self.start, self.end, self.score = entity_type, start, end, score


class AnalyzerEngine:
    def __init__(self, nlp_engine, supported_languages):
        self.languages = supported_languages
        self.registry = Registry()

    def analyze(self, text, language, score_threshold=0):
        if language not in self.languages:
            raise ValueError(f'No matching recognizers were found to serve the request ({language}).')
        supported = {entity for r in self.registry.recognizers for entity in r.supported_entities}
        found = []
        for value, (entity_type, score) in json.loads(os.environ.get('FAKE_PRESIDIO_ENTITIES', '{}')).items():
            if entity_type in supported and score >= score_threshold:
                found += [RecognizerResult(entity_type, m.start(), m.end(), score) for m in re.finditer(re.escape(value), text)]
        return found
