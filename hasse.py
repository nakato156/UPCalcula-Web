import graphviz
import argparse
from pathlib import Path

path_diagram =  Path(__file__).parent / 'static' / 'imgs' / 'diagrama_hasse'

def eliminar_relaciones(A:list[str], R:list[tuple]) -> list:
    # Eliminar reflexividad
    R_new = set([(x, y) for (x, y) in R if x != y])
    
    # Eliminar simetría
    R_new = R_new.difference(set([(y, x) for (x, y) in R_new]))
    
    # Eliminar Transitividad
    cambios = True
    while cambios:
        cambios = False
        for a, b in set(R_new):
            for c, d in set(R_new):
                if b == c and (a, d) in R_new.copy() and (a, b) in R_new.copy() and (c, d) in R_new.copy():
                    R_new.remove((a, d))
                    cambios = True
    
    return list(R_new)

def graficar_hasse(conjunto:list, relacion:list, path:Path=path_diagram) -> Path:
    R_hasse = list(eliminar_relaciones(conjunto, relacion))

    dot = graphviz.Digraph()
    for elem in conjunto: 
        dot.node(str(elem))

    for x, y in R_hasse:
        dot.edge(str(x), str(y), arrowhead='none')

    dot.attr(layout='dot')
    dot.attr(rankdir='BT')
    dot.attr('edge', style='solid')
    return Path(dot.render(path, format='png'))

if __name__ == "__main__":
    from ast import literal_eval
    from os import system, getcwd
    import re
    
    regex = re.compile(r'[^\d(),]+')

    parser = argparse.ArgumentParser(description='Generador de diagramas Hasse')
    parser.add_argument('-conjunto', type=str, help='conjunto de elementos separados por comas')
    parser.add_argument('-relacion', type=str, help='relacion de elementos separados por comas')
    parser.add_argument('--preview', type=bool, help='Abre una previzualización del diagrama', default=False)
    parser.add_argument('--imgBytes', type=bool, help='Muestra el diagrama en binario de la imagen', default=False)
    args = parser.parse_args()

    conjunto = args.conjunto[1:-1].split(',')
    relacion = args.relacion[1:-1]
    relacion = regex.sub(lambda x: f'"{x.group(0)}"', relacion)
    relacion = literal_eval(relacion)

    print(f"conjunto: {conjunto}\nrelacion: {relacion}")
    path = Path(getcwd()) / 'diagrama'
    if args.preview:
        system(f'start {graficar_hasse(conjunto, relacion, str(path))}')
    
    if args.imgBytes:
        print(graficar_hasse(conjunto, relacion, path).read_bytes())
