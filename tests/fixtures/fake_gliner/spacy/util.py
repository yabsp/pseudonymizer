import os


def is_package(name):
    return name not in os.environ.get('FAKE_SPACY_MISSING', '').split(',')
