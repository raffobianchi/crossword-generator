import json
import requests
import time
from typing import Optional, Dict
import re
import os

class WikiDictionaryConverter:
    def __init__(self):
        self.base_url = "https://it.wikipedia.org/w/api.php"
        self.session = requests.Session()
    
    def get_wiki_definition(self, word: str) -> Optional[str]:
        """Ottiene la definizione da Wikipedia."""
        try:
            params = {
                "action": "query",
                "format": "json",
                "titles": word,
                "prop": "extracts",
                "exintro": True,
                "explaintext": True,
                "redirects": 1
            }
            
            response = self.session.get(self.base_url, params=params)
            data = response.json()
            
            pages = data["query"]["pages"]
            page_id = list(pages.keys())[0]
            
            if page_id == "-1":
                return None
            
            text = pages[page_id].get("extract", "")
            
            definition = self._clean_definition(text)
            if definition:
                return definition[:100]
            
            return None
            
        except Exception as e:
            print(f"Errore nel recupero della definizione per {word}: {str(e)}")
            return None
    
    def _clean_definition(self, text: str) -> Optional[str]:
        if not text:
            return None
        
        sentences = text.split('.')
        if not sentences:
            return None
        
        first_sentence = sentences[0].strip()
        first_sentence = re.sub(r'\([^)]*\)', '', first_sentence)
        first_sentence = re.sub(r'\s+', ' ', first_sentence)
        
        return first_sentence.strip()
    
    def estimate_difficulty(self, word: str) -> int:
        length = len(word)
        if length <= 4:
            return 1
        elif length <= 7:
            return 2
        else:
            return 3

def main():
    # Configura questi percorsi
    input_file = "data/parole_italiane.txt"
    output_file = "data/dizionario.json"
    max_words = 50
    
    # Verifica che il file esista
    if not os.path.exists(input_file):
        print(f"Errore: File {input_file} non trovato!")
        return
    
    print(f"Leggendo il file: {input_file}")
    
    try:
        # Leggi e mostra alcune statistiche iniziali
        with open(input_file, 'r', encoding='utf-8') as f:
            raw_words = f.readlines()
        
        print(f"Lette {len(raw_words)} righe dal file")
        
        # Pulisci e filtra le parole
        words = []
        for line in raw_words:
            word = line.strip().upper()
            if word:  # se la parola non è vuota
                if word.isalpha():  # se contiene solo lettere
                    if 3 <= len(word) <= 15:  # se ha lunghezza corretta
                        if not any(c in 'JKWXY' for c in word):  # se non contiene lettere non italiane
                            words.append(word)
                        else:
                            print(f"Scartata (lettere non italiane): {word}")
                    else:
                        print(f"Scartata (lunghezza): {word}")
                else:
                    print(f"Scartata (non alfabetica): {word}")
        
        print(f"\nParole valide trovate: {len(words)}")
        print("Prime 5 parole:")
        for w in words[:5]:
            print(f"- {w}")
        
        # Limita il numero di parole
        words = words[:max_words]
        total = len(words)
        
        converter = WikiDictionaryConverter()
        words_dict = {}
        
        print(f"\nProcessando {total} parole...")
        
        for i, word in enumerate(words, 1):
            print(f"[{i}/{total}] Processando: {word}")
            
            if word not in words_dict:
                definition = converter.get_wiki_definition(word)
                if definition:
                    words_dict[word] = {
                        "word": word,
                        "definition": definition,
                        "difficulty": converter.estimate_difficulty(word)
                    }
                    print(f"✓ Definizione trovata: {definition[:50]}...")
                else:
                    print(f"✗ Nessuna definizione trovata per {word}")
                
                time.sleep(1)
        
        # Salva il risultato
        result = {
            "words": list(words_dict.values())
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\nConversione completata!")
        print(f"Parole totali lette: {len(raw_words)}")
        print(f"Parole valide trovate: {len(words)}")
        print(f"Definizioni trovate: {len(words_dict)}")
        print(f"File salvato in: {output_file}")
        
    except Exception as e:
        print(f"Errore durante la conversione: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()