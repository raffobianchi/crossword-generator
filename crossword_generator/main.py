import tkinter as tk
from crossword.gui import CrosswordGUI

def main():
    root = tk.Tk()
    app = CrosswordGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()