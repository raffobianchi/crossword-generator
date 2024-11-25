import requests
import os

def download_word_list():
    # URL del file raw da GitHub
    url = "https://raw.githubusercontent.com/napolux/paroleitaliane/master/paroleitaliane/60000_parole_italiane.txt"
    
    # Assicurati che la cartella data esista
    if not os.path.exists('data'):
        os.makedirs('data')
    
    # Scarica il file
    print("Scaricamento del file di parole...")
    response = requests.get(url)
    
    if response.status_code == 200:
        # Salva il file
        with open('data/parole_italiane.txt', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("File scaricato con successo in data/parole_italiane.txt")
    else:
        print(f"Errore nel download: {response.status_code}")

if __name__ == "__main__":
    download_word_list()