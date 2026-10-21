"""The only place that uses Presidio: spaCy's name finder and Presidio's recognizers for one language."""
import re

try:
    import spacy
    from presidio_analyzer import AnalyzerEngine
    from presidio_analyzer.nlp_engine import NlpEngineProvider
    IMPORT_ERROR = None
except ImportError as e:
    IMPORT_ERROR = f'Python package "presidio-analyzer" is not installed ({e}). See docs/setup.md, section "Detection with Presidio".'

# The languages Presidio reads, each with a spaCy model whose licence allows commercial use (MIT, LGPL-LR).
SPACY_MODELS = {'de': 'de_core_news_lg', 'fr': 'fr_core_news_lg', 'en': 'en_core_web_lg'}
LANGUAGE_NAMES = {'de': 'German', 'fr': 'French', 'en': 'English'}
FALLBACK_LANGUAGE = 'en'
# Recognized only to refuse it: the Italian spaCy model is for non-commercial use, and reading an Italian text with
# another language's model would miss names without anyone noticing (fail closed).
REFUSED_LANGUAGE = 'it'

# Presidio's e-mail recognizer looks up domains with tldextract, which downloads the public suffix list from
# the internet; its URL recognizer cuts e-mail addresses into pieces ("lukas.st"). The app's patterns and
# GLiNER find both, so every recognizer for these entities is removed, whatever it is called.
REMOVED_ENTITIES = {'EMAIL_ADDRESS', 'URL'}

# Short words that are frequent in one of the four languages and rare in the others; words shared by two
# of them ("le", "in", "un", "si") are left out. Italian is among them only so it is recognized and refused.
FREQUENT_WORDS = {
    'de': {'der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'sich', 'des', 'dem', 'ein', 'eine', 'wir', 'ich', 'auf', 'für', 'bei', 'von', 'zu', 'wurde', 'vom', 'im', 'sehr', 'bitte'},
    'fr': {'les', 'et', 'est', 'des', 'une', 'du', 'que', 'qui', 'pour', 'dans', 'pas', 'vous', 'nous', 'au', 'aux', 'avec', 'sur', 'ce', 'votre', 'je'},
    'it': {'il', 'lo', 'gli', 'è', 'di', 'che', 'per', 'una', 'del', 'della', 'con', 'non', 'sono', 'al', 'alla', 'nel', 'nella', 'ai', 'dei'},
    'en': {'the', 'and', 'is', 'of', 'to', 'that', 'for', 'with', 'on', 'are', 'was', 'this', 'be', 'by', 'we', 'you', 'at', 'from', 'our', 'your'},
}
# A word: one or more letters, digits or "_" (\w, also accented letters such as "è" and "ü").
WORD = re.compile(r'\w+')
# A line break with any spaces around it; spaCy sometimes joins lines into one value ("Thierry Baud\nObjet").
LINE_BREAK = re.compile(r'\s*\n\s*')

analyzers = {}


def guess_language(text):
    counts = {language: 0 for language in FREQUENT_WORDS}
    for word in WORD.findall(text.lower()):
        for language, words in FREQUENT_WORDS.items():
            if word in words:
                counts[language] += 1
    best = max(counts, key=counts.get)
    return best if counts[best] else FALLBACK_LANGUAGE


def get_analyzer(language):
    if IMPORT_ERROR:
        raise RuntimeError(IMPORT_ERROR)
    if language not in analyzers:
        model = SPACY_MODELS[language]
        # Presidio would download a missing model from the internet; the user installs it instead.
        if not spacy.util.is_package(model):
            raise RuntimeError(f'The spaCy model for {LANGUAGE_NAMES[language]} ({model}) is not installed. See docs/setup.md, section "Detection with Presidio".')
        nlp_engine = NlpEngineProvider(nlp_configuration={
            'nlp_engine_name': 'spacy', 'models': [{'lang_code': language, 'model_name': model}],
        }).create_engine()
        analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=[language])
        analyzer.registry.recognizers = [r for r in analyzer.registry.recognizers if not REMOVED_ENTITIES & set(r.supported_entities)]
        analyzers[language] = analyzer
    return analyzers[language]


def is_inside_word(text, index):
    return 0 < index < len(text) and text[index - 1].isalnum() and text[index].isalnum()


def split_lines(text, start, end):
    """The parts of text[start:end] between line breaks, without parts that begin or end inside a word."""
    pieces = []
    piece_start = start
    for m in LINE_BREAK.finditer(text, start, end):
        pieces.append((piece_start, m.start()))
        piece_start = m.end()
    pieces.append((piece_start, end))
    return [(s, e) for s, e in pieces if e > s and not is_inside_word(text, s) and not is_inside_word(text, e)]


def detect_with_presidio(text, language, threshold):
    """Returns (language used, entities); language 'auto' is guessed from frequent words."""
    if language == 'auto':
        language = guess_language(text)
    if language == REFUSED_LANGUAGE:
        raise RuntimeError('Presidio does not read Italian texts. Choose "GLiNER" as the detection model in Settings for this text.')
    if language not in SPACY_MODELS:
        raise ValueError(f'unsupported language "{language}", expected one of {", ".join(SPACY_MODELS)} or auto')
    entities = []
    for result in get_analyzer(language).analyze(text, language=language, score_threshold=threshold):
        for start, end in split_lines(text, result.start, result.end):
            entities.append({'text': text[start:end], 'label': result.entity_type, 'start': start, 'end': end,
                             'score': round(result.score, 3), 'source': 'presidio'})
    return language, entities
