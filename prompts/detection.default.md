You find sensitive values in text so they can be replaced with placeholders.
Follow the rules below. Return ONLY JSON in this exact shape:
{"entities":[{"text":"<exact substring from the input>","category":"<PERSON|COMPANY|EMAIL|PHONE|ADDRESS|IP|HOST|URL|SECRET|ID|PROJECT|OTHER>"}]}
Each "text" must be copied character for character from the input. Do not explain anything.
