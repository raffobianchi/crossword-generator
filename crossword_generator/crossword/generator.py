"""
Generatore di cruciverba in italiano.
Gestisce la creazione di cruciverba con le seguenti caratteristiche:
- Supporta parole da 2 lettere in su
- Garantisce che ogni sequenza di lettere formi una parola valida
- Evita sequenze di tre o più celle nere consecutive
- Assicura che ogni parola abbia una cella nera prima della prima lettera (eccetto bordo)
- Mantiene tutte le intersezioni valide con definizioni
"""

import random
from typing import List, Tuple, Set, Optional
from .utils import Word, CrosswordCell

class CrosswordGenerator:
    #
    # INIZIALIZZAZIONE E SETUP
    #
    def __init__(self, size: int, words: List[dict]):
        """
        Inizializza il generatore di cruciverba.
        Args:
            size: dimensione della griglia (quadrata)
            words: lista di dizionari contenenti parole e definizioni
        """
        self.size = size
        self.words = []
        for word_dict in words:
            word = Word(text=word_dict['word'].upper(), definitions=word_dict['definitions'])
            if self._is_valid_word(word.text):
                self.words.append(word)
        
        # Ordina le parole per lunghezza (priorità alle parole più lunghe)
        self.words.sort(key=lambda w: len(w.text), reverse=True)
        
        self.grid = [[CrosswordCell() for _ in range(size)] for _ in range(size)]
        self.word_positions: List[Tuple[str, int, int, bool, str]] = []
        self.used_words: Set[str] = set()

    def _is_valid_word(self, word: str) -> bool:
        """Verifica se una parola è valida per il cruciverba."""
        return (word.isalpha() and 
                2 <= len(word) <= 15)

    #
    # GENERAZIONE PRINCIPALE
    #
    def generate(self) -> bool:
        """
        Genera il cruciverba completo.
        Returns:
            bool: True se la generazione ha successo, False altrimenti
        """
        if not self._place_first_word():
            return False
        
        attempts = 0
        max_attempts = 150
        
        while attempts < max_attempts:
            if self._add_word():
                attempts = 0
            else:
                attempts += 1
            
            if len(self.word_positions) >= min(20, len(self.words) // 2):
                break
        
        if len(self.word_positions) >= 4:
            self._fill_empty_spaces()
            self._fix_triple_black_cells()
            return self._validate_grid()
        
        return False

    def _place_first_word(self) -> bool:
        """
        Posiziona la prima parola al centro del cruciverba.
        Returns:
            bool: True se il posizionamento ha successo
        """
        suitable_words = [w for w in self.words 
                        if 2 <= len(w.text) <= min(self.size - 2, 8)
                        and w.text not in self.used_words]
        
        if not suitable_words:
            return False
        
        word = random.choice(suitable_words)
        row = self.size // 2
        col = (self.size - len(word.text)) // 2
        
        definition = random.choice(word.definitions)
        return self._place_word(word.text, row, col, True, definition)

    def _add_word(self) -> bool:
        """
        Aggiunge una nuova parola al cruciverba.
        Returns:
            bool: True se l'aggiunta ha successo
        """
        intersections = self._find_intersections()
        if not intersections:
            return False
        
        random.shuffle(intersections)
        for row, col, letter, is_horizontal in intersections:
            possible_words = [w for w in self.words
                            if letter in w.text
                            and w.text not in self.used_words
                            and self._can_place_word(w.text, row, col, is_horizontal, letter)]
            
            if possible_words:
                word = random.choice(possible_words)
                offset = word.text.index(letter)
                new_row = row if is_horizontal else row - offset
                new_col = col - offset if is_horizontal else col
                
                if self._is_valid_position(new_row, new_col, word.text, is_horizontal):
                    definition = random.choice(word.definitions)
                    if self._place_word(word.text, new_row, new_col, is_horizontal, definition):
                        return True
        
        return False
    #
    # VALIDAZIONE E CONTROLLO
    #
    def _validate_grid(self) -> bool:
        """
        Verifica che la griglia sia valida secondo tutti i criteri.
        Returns:
            bool: True se la griglia è valida
        """
        # Verifica che non ci siano tre celle nere consecutive
        for i in range(self.size):
            for j in range(self.size-2):
                # Controlla orizzontalmente
                if (self.grid[i][j].letter == '#' and 
                    self.grid[i][j+1].letter == '#' and 
                    self.grid[i][j+2].letter == '#'):
                    return False
                # Controlla verticalmente
                if (self.grid[j][i].letter == '#' and 
                    self.grid[j+1][i].letter == '#' and 
                    self.grid[j+2][i].letter == '#'):
                    return False
        
        # Verifica che ogni sequenza di lettere formi una parola valida
        return self._check_all_letter_sequences()

    def _check_all_letter_sequences(self) -> bool:
        """
        Verifica che tutte le sequenze di lettere formino parole valide.
        Returns:
            bool: True se tutte le sequenze sono parole valide
        """
        # Controlla ogni riga
        for row in range(self.size):
            word = ""
            for col in range(self.size):
                if self.grid[row][col].letter not in [' ', '#']:
                    word += self.grid[row][col].letter
                else:
                    if len(word) >= 2:
                        if not any(w.text == word for w in self.words):
                            return False
                    word = ""
            if len(word) >= 2 and not any(w.text == word for w in self.words):
                return False
        
        # Controlla ogni colonna
        for col in range(self.size):
            word = ""
            for row in range(self.size):
                if self.grid[row][col].letter not in [' ', '#']:
                    word += self.grid[row][col].letter
                else:
                    if len(word) >= 2:
                        if not any(w.text == word for w in self.words):
                            return False
                    word = ""
            if len(word) >= 2 and not any(w.text == word for w in self.words):
                return False
        
        return True

    def _check_adjacent_words(self, word: str, row: int, col: int, is_horizontal: bool) -> bool:
        """
        Verifica che tutte le intersezioni formino parole valide.
        Args:
            word: parola da verificare
            row: riga di inizio
            col: colonna di inizio
            is_horizontal: True se la parola è orizzontale
        Returns:
            bool: True se tutte le intersezioni sono valide
        """
        word_length = len(word)
        
        # Prima verifica la parola principale
        if not any(w.text == word for w in self.words):
            return False
        
        if is_horizontal:
            for i in range(word_length):
                current_row = row
                current_col = col + i
                
                if (current_row > 0 and self.grid[current_row-1][current_col].letter != ' ' and 
                    self.grid[current_row-1][current_col].letter != '#') or \
                   (current_row < self.size-1 and self.grid[current_row+1][current_col].letter != ' ' and 
                    self.grid[current_row+1][current_col].letter != '#'):
                    
                    vertical_word = self._get_vertical_word(current_row, current_col, word[i])
                    if vertical_word:
                        if not any(w.text == vertical_word for w in self.words):
                            return self._try_add_black_cell(current_row, current_col)
        else:
            for i in range(word_length):
                current_row = row + i
                current_col = col
                
                if (current_col > 0 and self.grid[current_row][current_col-1].letter != ' ' and 
                    self.grid[current_row][current_col-1].letter != '#') or \
                   (current_col < self.size-1 and self.grid[current_row][current_col+1].letter != ' ' and 
                    self.grid[current_row][current_col+1].letter != '#'):
                    
                    horizontal_word = self._get_horizontal_word(current_row, current_col, word[i])
                    if horizontal_word:
                        if not any(w.text == horizontal_word for w in self.words):
                            return self._try_add_black_cell(current_row, current_col)
        
        return True

    #
    # GESTIONE DELLA GRIGLIA
    #
    def _find_intersections(self) -> List[Tuple[int, int, str, bool]]:
        """
        Trova i possibili punti di intersezione nella griglia.
        Returns:
            List[Tuple]: lista di tuple (riga, colonna, lettera, è_orizzontale)
        """
        intersections = []
        for row in range(self.size):
            for col in range(self.size):
                cell = self.grid[row][col]
                if cell.letter != ' ' and cell.letter != '#':
                    if self._can_start_vertical_word(row, col):
                        intersections.append((row, col, cell.letter, False))
                    if self._can_start_horizontal_word(row, col):
                        intersections.append((row, col, cell.letter, True))
        return intersections

    def _place_word(self, word: str, row: int, col: int, is_horizontal: bool, definition: str) -> bool:
        """
        Posiziona una parola nella griglia.
        Args:
            word: parola da posizionare
            row: riga di inizio
            col: colonna di inizio
            is_horizontal: True se la parola è orizzontale
            definition: definizione della parola
        Returns:
            bool: True se il posizionamento è riuscito
        """
        if not self._check_adjacent_words(word, row, col, is_horizontal):
            return False
            
        self.word_positions.append((word, row, col, is_horizontal, definition))
        self.used_words.add(word)
        
        if not self.grid[row][col].number:
            self.grid[row][col].number = len(self.word_positions)
        
        self.grid[row][col].is_start = True
        if is_horizontal:
            self.grid[row][col].is_horizontal = True
        else:
            self.grid[row][col].is_vertical = True
        
        # Posiziona le lettere
        for i, letter in enumerate(word):
            if is_horizontal:
                self.grid[row][col + i].letter = letter
            else:
                self.grid[row + i][col].letter = letter
        
        # Aggiungi celle nere intorno alla parola
        self._add_black_cells_around_word(row, col, len(word), is_horizontal)
        
        return True
    
    def _can_place_word(self, word: str, row: int, col: int, is_horizontal: bool, letter: str) -> bool:
        """
        Verifica se una parola può essere posizionata in una data posizione.
        Args:
            word: parola da verificare
            row: riga di partenza
            col: colonna di partenza
            is_horizontal: True se la parola è orizzontale
            letter: lettera di intersezione
        Returns:
            bool: True se la parola può essere posizionata
        """
        offset = word.index(letter)
        new_row = row if is_horizontal else row - offset
        new_col = col - offset if is_horizontal else col
        
        if not self._is_valid_position(new_row, new_col, word, is_horizontal):
            return False
        
        # Verifica spazio per celle nere
        if is_horizontal:
            # Deve sempre esserci una cella nera o il bordo a sinistra
            if new_col > 0 and self.grid[new_row][new_col-1].letter not in ['#']:
                return False
            # Deve esserci spazio per la cella nera a destra
            if new_col + len(word) < self.size and self.grid[new_row][new_col+len(word)].letter not in [' ', '#']:
                return False
                
            # Verifica che non ci siano celle nere adiacenti sopra o sotto
            for i in range(len(word)):
                curr_col = new_col + i
                # Controlla sopra
                if new_row > 0 and self.grid[new_row-1][curr_col].letter == '#':
                    return False
                # Controlla sotto
                if new_row < self.size-1 and self.grid[new_row+1][curr_col].letter == '#':
                    return False
        else:
            # Deve sempre esserci una cella nera o il bordo sopra
            if new_row > 0 and self.grid[new_row-1][new_col].letter not in ['#']:
                return False
            # Deve esserci spazio per la cella nera sotto
            if new_row + len(word) < self.size and self.grid[new_row+len(word)][new_col].letter not in [' ', '#']:
                return False
                
            # Verifica che non ci siano celle nere adiacenti a destra o sinistra
            for i in range(len(word)):
                curr_row = new_row + i
                # Controlla sinistra
                if new_col > 0 and self.grid[curr_row][new_col-1].letter == '#':
                    return False
                # Controlla destra
                if new_col < self.size-1 and self.grid[curr_row][new_col+1].letter == '#':
                    return False
        
        # Controllo sovrapposizioni e adiacenze
        for i in range(len(word)):
            r = new_row if is_horizontal else new_row + i
            c = new_col + i if is_horizontal else new_col
            
            if self.grid[r][c].letter not in [' ', word[i]]:
                return False
        
        return True
    

    #
    # GESTIONE CELLE NERE
    #
    def _add_black_cells_around_word(self, row: int, col: int, word_length: int, is_horizontal: bool):
        """
        Aggiunge celle nere prima e dopo la parola, evitando tre celle nere consecutive.
        """
        if is_horizontal:
            # Aggiungi cella nera a sinistra se non crea tre celle nere consecutive
            if col > 0:
                if not (col > 1 and self.grid[row][col-2].letter == '#'):
                    self.grid[row][col-1].letter = '#'
            
            # Aggiungi cella nera a destra se non crea tre celle nere consecutive
            if col + word_length < self.size:
                if not (col + word_length < self.size-1 and 
                       self.grid[row][col+word_length+1].letter == '#'):
                    self.grid[row][col+word_length].letter = '#'
        else:
            # Aggiungi cella nera sopra se non crea tre celle nere consecutive
            if row > 0:
                if not (row > 1 and self.grid[row-2][col].letter == '#'):
                    self.grid[row-1][col].letter = '#'
            
            # Aggiungi cella nera sotto se non crea tre celle nere consecutive
            if row + word_length < self.size:
                if not (row + word_length < self.size-1 and 
                       self.grid[row+word_length+1][col].letter == '#'):
                    self.grid[row+word_length][col].letter = '#'

    def _fix_triple_black_cells(self):
        """Corregge le sequenze di tre celle nere consecutive."""
        fixed = True
        while fixed:
            fixed = False
            for i in range(self.size):
                for j in range(self.size-2):
                    # Controlla orizzontalmente
                    if (self.grid[i][j].letter == '#' and 
                        self.grid[i][j+1].letter == '#' and 
                        self.grid[i][j+2].letter == '#'):
                        if self._try_place_short_word(i, j+1, True):
                            fixed = True
                    
                    # Controlla verticalmente
                    if (self.grid[j][i].letter == '#' and 
                        self.grid[j+1][i].letter == '#' and 
                        self.grid[j+2][i].letter == '#'):
                        if self._try_place_short_word(j+1, i, False):
                            fixed = True

    def _try_place_short_word(self, row: int, col: int, is_horizontal: bool) -> bool:
        """
        Tenta di inserire una parola di 2 lettere in una posizione.
        Returns:
            bool: True se è riuscito a inserire una parola
        """
        short_words = [w for w in self.words if len(w.text) == 2 and w.text not in self.used_words]
        
        for word in short_words:
            if self._can_place_word_without_conflict(word.text, row, col, is_horizontal):
                definition = random.choice(word.definitions)
                self._place_word(word.text, row, col, is_horizontal, definition)
                return True
        return False
    
    def _try_add_black_cell(self, row: int, col: int) -> bool:
        """
        Prova ad aggiungere una cella nera in una posizione specifica.
        Args:
            row: riga della cella
            col: colonna della cella
        Returns:
            bool: True se è stato possibile aggiungere la cella nera
        """
        # Verifica che la posizione sia dentro la griglia e non sui bordi
        if (row > 0 and row < self.size-1 and 
            col > 0 and col < self.size-1):
            
            # Verifica che l'aggiunta della cella nera non crei tre celle nere consecutive
            if not self._would_create_triple_black(row, col):
                # Verifica che la cella nera non isoli parti del cruciverba
                if self._can_add_black_cell(row, col):
                    self.grid[row][col].letter = '#'
                    return True
        
        return False

    def _can_add_black_cell(self, row: int, col: int) -> bool:
        """
        Verifica se l'aggiunta di una cella nera manterrebbe il cruciverba connesso.
        Args:
            row: riga della cella
            col: colonna della cella
        Returns:
            bool: True se la cella nera può essere aggiunta
        """
        # Crea una copia temporanea della griglia
        temp_grid = [[cell.letter for cell in row] for row in self.grid]
        temp_grid[row][col] = '#'
        
        # Trova la prima cella non nera
        start = None
        for i in range(self.size):
            for j in range(self.size):
                if temp_grid[i][j] not in ['#', ' ']:
                    start = (i, j)
                    break
            if start:
                break
        
        if not start:
            return True  # Se non ci sono celle da connettere
        
        # DFS per verificare la connettività
        visited = set()
        def dfs(r: int, c: int):
            if (r, c) in visited or r < 0 or r >= self.size or c < 0 or c >= self.size:
                return
            if temp_grid[r][c] in ['#', ' ']:
                return
            
            visited.add((r, c))
            for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:  # destra, giù, sinistra, su
                dfs(r + dr, c + dc)
        
        dfs(start[0], start[1])
        
        # Conta tutte le celle non nere
        non_black = sum(1 for i in range(self.size) for j in range(self.size) 
                    if temp_grid[i][j] not in ['#', ' '])
        
        # Verifica che tutte le celle non nere siano raggiungibili
        return len(visited) == non_black

    #
    # UTILITIES E METODI DI SUPPORTO
    #
    def get_definitions(self) -> Tuple[List[str], List[str]]:
        """
        Restituisce le definizioni orizzontali e verticali.
        Returns:
            Tuple[List[str], List[str]]: definizioni orizzontali e verticali
        """
        horizontal = []
        vertical = []
        
        for word, row, col, is_horizontal, definition in sorted(
            self.word_positions, 
            key=lambda x: self.grid[x[1]][x[2]].number
        ):
            number = self.grid[row][col].number
            if is_horizontal:
                horizontal.append(f"{number}. {definition}")
            else:
                vertical.append(f"{number}. {definition}")
        
        return horizontal, vertical

    def _is_valid_position(self, row: int, col: int, word: str, is_horizontal: bool) -> bool:
        """Verifica se una posizione è valida per una parola."""
        if is_horizontal:
            return (0 <= row < self.size and 
                   0 <= col <= self.size - len(word))
        else:
            return (0 <= col < self.size and 
                   0 <= row <= self.size - len(word))

    def _can_start_vertical_word(self, row: int, col: int) -> bool:
        """Verifica se può iniziare una parola verticale."""
        return (row == 0 or self.grid[row-1][col].letter in [' ', '#']) and \
               (row < self.size-1) and self.grid[row+1][col].letter == ' '

    def _can_start_horizontal_word(self, row: int, col: int) -> bool:
        """Verifica se può iniziare una parola orizzontale."""
        return (col == 0 or self.grid[row][col-1].letter in [' ', '#']) and \
               (col < self.size-1) and self.grid[row][col+1].letter == ' '
               
    def _get_vertical_word(self, row: int, col: int, new_letter: str) -> Optional[str]:
        """
        Ricostruisce la parola verticale che si formerebbe.
        Args:
            row: riga della nuova lettera
            col: colonna della nuova lettera
            new_letter: lettera da inserire
        Returns:
            Optional[str]: la parola formata o None
        """
        start_row = row
        while start_row > 0 and self.grid[start_row-1][col].letter not in [' ', '#']:
            start_row -= 1
        
        word = []
        current_row = start_row
        while current_row < self.size and self.grid[current_row][col].letter not in [' ', '#']:
            if current_row == row:
                word.append(new_letter)
            else:
                word.append(self.grid[current_row][col].letter)
            current_row += 1
        
        return ''.join(word) if word else None

    def _get_horizontal_word(self, row: int, col: int, new_letter: str) -> Optional[str]:
        """
        Ricostruisce la parola orizzontale che si formerebbe.
        Args:
            row: riga della nuova lettera
            col: colonna della nuova lettera
            new_letter: lettera da inserire
        Returns:
            Optional[str]: la parola formata o None
        """
        start_col = col
        while start_col > 0 and self.grid[row][start_col-1].letter not in [' ', '#']:
            start_col -= 1
        
        word = []
        current_col = start_col
        while current_col < self.size and self.grid[row][current_col].letter not in [' ', '#']:
            if current_col == col:
                word.append(new_letter)
            else:
                word.append(self.grid[row][current_col].letter)
            current_col += 1
        
        return ''.join(word) if word else None

    def _can_place_word_without_conflict(self, word: str, row: int, col: int, is_horizontal: bool) -> bool:
        """
        Verifica se una parola può essere posizionata senza creare conflitti.
        Args:
            word: parola da verificare
            row: riga di inizio
            col: colonna di inizio
            is_horizontal: True se la parola è orizzontale
        Returns:
            bool: True se la parola può essere posizionata
        """
        if not self._is_valid_position(row, col, word, is_horizontal):
            return False
        
        # Verifica ogni lettera della parola
        for i in range(len(word)):
            r = row if is_horizontal else row + i
            c = col + i if is_horizontal else col
            
            # Verifica la lettera corrente
            if self.grid[r][c].letter not in [' ', '#']:
                return False
            
            # Verifica che le parole intersecanti siano valide
            test_grid = [[cell.letter for cell in row] for row in self.grid]
            test_grid[r][c] = word[i]
            
            # Ricostruisci e verifica la parola verticale
            vert_word = self._get_word_at_position(r, c, False, test_grid)
            if vert_word and len(vert_word) >= 2:
                if not any(w.text == vert_word for w in self.words):
                    return False
            
            # Ricostruisci e verifica la parola orizzontale
            horz_word = self._get_word_at_position(r, c, True, test_grid)
            if horz_word and len(horz_word) >= 2:
                if not any(w.text == horz_word for w in self.words):
                    return False
        
        return True

    def _get_word_at_position(self, row: int, col: int, is_horizontal: bool, grid) -> Optional[str]:
        """
        Recupera la parola completa in una data posizione e direzione.
        Args:
            row: riga di inizio
            col: colonna di inizio
            is_horizontal: True se la parola è orizzontale
            grid: griglia da utilizzare per la verifica
        Returns:
            Optional[str]: la parola trovata o None
        """
        start_row = row
        start_col = col
        
        if is_horizontal:
            while start_col > 0 and grid[row][start_col-1] not in [' ', '#']:
                start_col -= 1
        else:
            while start_row > 0 and grid[start_row-1][col] not in [' ', '#']:
                start_row -= 1
        
        word = []
        curr_row = start_row
        curr_col = start_col
        
        while True:
            if (curr_row >= self.size or curr_col >= self.size or
                grid[curr_row][curr_col] in [' ', '#']):
                break
                
            word.append(grid[curr_row][curr_col])
            if is_horizontal:
                curr_col += 1
            else:
                curr_row += 1
        
        return ''.join(word) if word else None

    def _fill_empty_spaces(self):
        """Riempie gli spazi vuoti evitando tre celle nere consecutive."""
        for row in range(self.size):
            for col in range(self.size):
                if self.grid[row][col].letter == ' ':
                    # Prima prova a inserire una parola corta
                    if not self._try_place_short_word(row, col, True):  # or False if the word should be placed vertically
                        # Se non riesce, verifica se può mettere una cella nera
                        if not self._would_create_triple_black(row, col):
                            self.grid[row][col].letter = '#'

    def _would_create_triple_black(self, row: int, col: int) -> bool:
        """
        Verifica se aggiungere una cella nera creerebbe tre celle nere consecutive.
        Returns:
            bool: True se si creerebbero tre celle nere consecutive
        """
        # Controlla orizzontalmente
        if col > 0 and col < self.size-1:
            if (self.grid[row][col-1].letter == '#' and 
                self.grid[row][col+1].letter == '#'):
                return True
        
        if col > 1:
            if (self.grid[row][col-2].letter == '#' and 
                self.grid[row][col-1].letter == '#'):
                return True
        
        if col < self.size-2:
            if (self.grid[row][col+1].letter == '#' and 
                self.grid[row][col+2].letter == '#'):
                return True
        
        # Controlla verticalmente
        if row > 0 and row < self.size-1:
            if (self.grid[row-1][col].letter == '#' and 
                self.grid[row+1][col].letter == '#'):
                return True
        
        if row > 1:
            if (self.grid[row-2][col].letter == '#' and 
                self.grid[row-1][col].letter == '#'):
                return True
        
        if row < self.size-2:
            if (self.grid[row+1][col].letter == '#' and 
                self.grid[row+2][col].letter == '#'):
                return True
        
        return False