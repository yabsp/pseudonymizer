"""Detection candidates for the benchmark. Each factory takes (options, app labels) and returns doc -> entities."""
import os


def device(options):
    import torch
    wanted = options.get('device', 'cpu')
    return 'cuda' if wanted == 'cuda' and torch.cuda.is_available() else 'cpu'


def gliner_baseline(options, labels, engine='gliner'):
    import gliner_helper
    model = options.get('model', 'urchade/gliner_multi_pii-v1')
    threshold = float(options.get('threshold', 0.4))
    request = {'labels': list(labels), 'threshold': threshold, 'model': model, 'engine': engine, 'language': 'auto'}
    gliner_helper.detect({**request, 'text': ''})
    if options.get('device') == 'cuda':
        gliner_helper.get_model(model).to('cuda')

    def run(doc):
        return gliner_helper.detect({**request, 'text': doc['text']})['entities']
    return run


# GLiNER2-PII's own label names (model card) -> app categories; None = read but not hidden.
GLINER2_LABELS = {
    'person': 'PERSON', 'organization': 'COMPANY', 'address': 'ADDRESS', 'street_address': 'ADDRESS',
    'city': 'ADDRESS', 'postal_code': None, 'email': 'EMAIL', 'phone_number': 'PHONE', 'iban': 'ID',
    'account_number': 'ID', 'national_id_number': 'ID', 'passport_number': 'ID', 'license_number': 'ID',
    'tax_id': 'ID', 'username': 'PERSON', 'ip_address': 'IP', 'password': 'SECRET', 'api_key': 'SECRET',
    'date_of_birth': 'DATE', 'case number': 'ID', 'project name': 'PROJECT', 'url': 'URL',
}


def gliner2(options, labels):
    """fastino/gliner2-privacy-filter-PII-multi, in the same 150-word windows as the app's GLiNER."""
    import gliner_helper
    from gliner2 import GLiNER2
    name = options.get('model', 'fastino/gliner2-privacy-filter-PII-multi')
    threshold = float(options.get('threshold', 0.5))
    model = GLiNER2.from_pretrained(name)
    model.to(device(options))
    which = options.get('labels', 'own')
    label_map = labels if which == 'app' else {**GLINER2_LABELS, **labels} if which == 'both' else GLINER2_LABELS
    names = list(label_map)

    def run(doc):
        text = doc['text']
        found = {}
        for start, end in gliner_helper.windows(text):
            result = model.extract_entities(text[start:end], names, threshold=threshold, include_confidence=True, include_spans=True)
            for label, values in result['entities'].items():
                for v in values:
                    span = (start + v['start'], start + v['end'])
                    if span not in found or v['confidence'] > found[span]['score']:
                        found[span] = {'text': text[span[0]:span[1]], 'category': label_map.get(label), 'label': label, 'score': round(v['confidence'], 3)}
        return list(found.values())
    return run


PRIVACY_FILTER_CATEGORIES = {
    'account_number': 'ID', 'private_address': 'ADDRESS', 'private_date': 'DATE', 'private_email': 'EMAIL',
    'private_person': 'PERSON', 'private_phone': 'PHONE', 'private_url': 'URL', 'secret': 'SECRET',
}


def privacy_filter(options, labels):
    """openai/privacy-filter, a token classifier (BIOES labels), whole document in one pass."""
    import torch
    from transformers import pipeline
    dev = device(options)
    classifier = pipeline('token-classification', model=options.get('model', 'openai/privacy-filter'),
                          aggregation_strategy='simple', device=0 if dev == 'cuda' else -1,
                          dtype=torch.float32 if dev == 'cpu' else torch.bfloat16)
    keep_dates = options.get('dates') == 'yes'

    def run(doc):
        text = doc['text']
        out = []
        for e in classifier(text):
            label = e['entity_group']
            category = PRIVACY_FILTER_CATEGORIES.get(label)
            if category == 'DATE' and not keep_dates:
                category = None
            out.append({'text': text[e['start']:e['end']].strip(), 'category': category, 'label': label, 'score': round(float(e['score']), 3)})
        return [e for e in out if e['text']]
    return run


# One user message, no system prompt: with a long system prompt listing what not to report, Qwen3-4B answered
# NONE even for texts with obvious leftovers. It still lists placeholders, which are dropped below.
REVIEW_PROMPT = (
    'Below is a text in which some names were replaced by placeholders like [[PERSON_1]]. Some identifying values '
    'were missed and are still written out. List each person name or initials, company or organisation name, street, '
    'town or village, and case/account/customer/file number that is still written out in the text. One per line as '
    'TYPE: value (TYPE is PERSON, COMPANY, ADDRESS or ID). Do not list placeholders.\n\nText:\n')
REVIEW_TYPES = {'PERSON': 'PERSON', 'COMPANY': 'COMPANY', 'ADDRESS': 'ADDRESS', 'STREET': 'ADDRESS', 'TOWN': 'ADDRESS', 'ID': 'ID', 'OTHER': 'ID'}


def llm_review(options, labels):
    """A local LLM (llama.cpp, GGUF) reads the pseudonymized text and lists values still in clear. Run it on the
    texts that score.mjs --dump-pseudo writes; only values that literally appear in the text are kept."""
    import json
    import re
    from llama_cpp import Llama
    llm = Llama(model_path=options['gguf'], n_ctx=int(options.get('ctx', 4096)), n_threads=int(options.get('threads', 8)),
                n_gpu_layers=int(options.get('gpu_layers', 0)), verbose=False)
    chunk = int(options.get('chunk', 2500))

    def parts(text):
        start = 0
        while start < len(text):
            end = min(len(text), start + chunk)
            if end < len(text):
                cut = text.rfind('\n', start + chunk // 2, end)
                end = cut + 1 if cut > 0 else end
            yield text[start:end]
            start = end

    def run(doc):
        found = []
        for part in parts(doc['text']):
            answer = llm.create_chat_completion(
                messages=[{'role': 'user', 'content': REVIEW_PROMPT + part}],
                temperature=0, max_tokens=int(options.get('max_tokens', 300)))
            # Free text, not a JSON grammar: llama.cpp's grammar sampling made each answer about 28x slower.
            for line in answer['choices'][0]['message']['content'].splitlines():
                kind, _, text = line.partition(':')
                text = text.strip().strip('"')
                if len(text) >= 2 and text in part and '[[' not in text and ']]' not in text:
                    found.append({'text': text, 'category': REVIEW_TYPES.get(kind.strip().upper(), 'ID' if any(c.isdigit() for c in text) else 'PERSON'), 'source': 'llm'})
        return found
    return run


CANDIDATES = {
    'gliner': gliner_baseline,
    'presidio': lambda options, labels: gliner_baseline(options, labels, engine='presidio'),
    'gliner2': gliner2,
    'privacy-filter': privacy_filter,
    'llm-review': llm_review,
}
