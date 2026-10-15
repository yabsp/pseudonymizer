class NlpEngineProvider:
    def __init__(self, nlp_configuration):
        self.models = nlp_configuration['models']

    def create_engine(self):
        return self.models
