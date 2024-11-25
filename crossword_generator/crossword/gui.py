import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import pickle
from datetime import datetime
from typing import Optional
from .utils import Word
from .generator import CrosswordGenerator

class CrosswordGUI:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Cruciverba Italiano")
        self.setup_gui()
        self.load_dictionary()
        
    def setup_gui(self):
        """Inizializza l'interfaccia grafica."""
        # Menu
        menubar = tk.Menu(self.root)
        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="Salva cruciverba", command=self.save_crossword)
        file_menu.add_command(label="Carica cruciverba", command=self.load_crossword)
        menubar.add_cascade(label="File", menu=file_menu)
        self.root.config(menu=menubar)
        
        # Frame principale
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Controlli
        self.setup_controls(main_frame)
        
        # Canvas e definizioni
        self.setup_canvas_and_definitions(main_frame)
        
        # Stato corrente
        self.current_generator: Optional[CrosswordGenerator] = None
        
    def setup_controls(self, parent):
        """Inizializza i controlli."""
        controls = ttk.Frame(parent)
        controls.grid(row=0, column=0, columnspan=2, pady=(0, 10))
        
        # Dimensione
        ttk.Label(controls, text="Dimensione:").grid(row=0, column=0, padx=5)
        self.size_var = tk.StringVar(value="15")
        ttk.Entry(controls, textvariable=self.size_var, width=5).grid(row=0, column=1)
        
        # Bottone genera
        ttk.Button(controls, text="Genera", 
                  command=self.generate_crossword).grid(row=0, column=2, padx=20)

    def setup_canvas_and_definitions(self, parent):
        """Inizializza il canvas e le definizioni."""
        self.CELL_SIZE = 40
        self.canvas = tk.Canvas(parent, bg='white')
        self.canvas.grid(row=1, column=0, padx=(0, 10))
        
        # Frame definizioni con notebook
        def_frame = ttk.Frame(parent)
        def_frame.grid(row=1, column=1, sticky=tk.N)
        
        self.def_notebook = ttk.Notebook(def_frame)
        self.def_notebook.grid(sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Tab orizzontali
        self.horizontal_frame = ttk.Frame(self.def_notebook)
        self.horizontal_text = tk.Text(self.horizontal_frame, width=30, height=20)
        self.horizontal_text.grid(sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Tab verticali
        self.vertical_frame = ttk.Frame(self.def_notebook)
        self.vertical_text = tk.Text(self.vertical_frame, width=30, height=20)
        self.vertical_text.grid(sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.def_notebook.add(self.horizontal_frame, text='Orizzontali')
        self.def_notebook.add(self.vertical_frame, text='Verticali')
        
    def load_dictionary(self):
        """Carica il dizionario delle parole."""
        try:
            with open('data/dizionario.json', 'r', encoding='utf-8') as f:
                # Il file è direttamente un array di oggetti
                self.words = json.load(f)
                print(f"Caricate {len(self.words)} parole dal dizionario")
                    
        except FileNotFoundError:
            messagebox.showerror("Errore", "File dizionario.json non trovato!")
            self.words = []
        except Exception as e:
            messagebox.showerror("Errore", f"Errore nel caricamento del dizionario: {str(e)}")
            self.words = []
        
    def generate_crossword(self):
        """Genera un nuovo cruciverba."""
        try:
            size = int(self.size_var.get())
            if not (5 <= size <= 20):
                raise ValueError("Dimensione deve essere tra 5 e 20")
        except ValueError:
            messagebox.showerror("Errore", "Dimensione non valida!")
            return
        
        self.current_generator = CrosswordGenerator(size, self.words)
        if self.current_generator.generate():
            self.draw_grid()
            self.update_definitions()
        else:
            messagebox.showerror("Errore", "Impossibile generare il cruciverba!")
    
    def draw_grid(self):
        """Disegna la griglia del cruciverba."""
        if not self.current_generator:
            return
        
        size = self.current_generator.size
        canvas_size = size * self.CELL_SIZE
        
        self.canvas.delete("all")
        self.canvas.config(width=canvas_size, height=canvas_size)
        
        for row in range(size):
            for col in range(size):
                x1 = col * self.CELL_SIZE
                y1 = row * self.CELL_SIZE
                x2 = x1 + self.CELL_SIZE
                y2 = y1 + self.CELL_SIZE
                
                cell = self.current_generator.grid[row][col]
                
                # Disegna cella
                fill_color = 'black' if cell.letter == '#' else 'white'
                self.canvas.create_rectangle(x1, y1, x2, y2, fill=fill_color)
                
                # Disegna numero
                if cell.number:
                    self.canvas.create_text(
                        x1 + 2, y1 + 2,
                        text=str(cell.number),
                        anchor=tk.NW,
                        font=('Arial', 8)
                    )
                
                # Disegna lettera
                if cell.letter not in [' ', '#']:
                    self.canvas.create_text(
                        x1 + self.CELL_SIZE/2,
                        y1 + self.CELL_SIZE/2,
                        text=cell.letter,
                        font=('Arial', 12, 'bold'),
                        fill='black' if fill_color == 'white' else 'white'
                    )
    
    def update_definitions(self):
        """Aggiorna le definizioni nelle tabs."""
        if not self.current_generator:
            return
        
        # Pulisci le definizioni esistenti
        self.horizontal_text.delete('1.0', tk.END)
        self.vertical_text.delete('1.0', tk.END)
        
        # Ottieni le definizioni ordinate
        horizontal_defs, vertical_defs = self.current_generator.get_definitions()
        
        # Inserisci le definizioni
        for definition in horizontal_defs:
            self.horizontal_text.insert(tk.END, f"{definition}\n")
        
        for definition in vertical_defs:
            self.vertical_text.insert(tk.END, f"{definition}\n")
    
    def save_crossword(self):
        """Salva il cruciverba corrente."""
        if not self.current_generator:
            messagebox.showwarning("Attenzione", "Nessun cruciverba da salvare!")
            return
        
        save_data = {
            'size': self.current_generator.size,
            'grid': [[cell.letter for cell in row] 
                    for row in self.current_generator.grid],
            'word_positions': self.current_generator.word_positions,
            'date_created': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".cw",
            filetypes=[("Cruciverba", "*.cw"), ("Tutti i file", "*.*")],
            initialfile=f"cruciverba_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )
        
        if filename:
            try:
                with open(filename, 'wb') as f:
                    pickle.dump(save_data, f)
                messagebox.showinfo("Successo", "Cruciverba salvato correttamente!")
            except Exception as e:
                messagebox.showerror("Errore", f"Errore nel salvataggio: {str(e)}")
    
    def load_crossword(self):
        """Carica un cruciverba salvato."""
        filename = filedialog.askopenfilename(
            filetypes=[("Cruciverba", "*.cw"), ("Tutti i file", "*.*")]
        )
        
        if filename:
            try:
                with open(filename, 'rb') as f:
                    save_data = pickle.load(f)
                
                # Ricrea il generatore
                size = save_data['size']
                self.current_generator = CrosswordGenerator(size, self.words)
                
                # Ripristina lo stato
                for i in range(size):
                    for j in range(size):
                        self.current_generator.grid[i][j].letter = save_data['grid'][i][j]
                
                self.current_generator.word_positions = save_data['word_positions']
                
                # Aggiorna GUI
                self.size_var.set(str(size))
                self.draw_grid()
                self.update_definitions()
                
                messagebox.showinfo("Successo", 
                                  f"Cruciverba caricato!\nCreato il: {save_data['date_created']}")
            except Exception as e:
                messagebox.showerror("Errore", f"Errore nel caricamento: {str(e)}")

def main():
    root = tk.Tk()
    app = CrosswordGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()