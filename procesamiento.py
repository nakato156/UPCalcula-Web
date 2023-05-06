from subprocess import check_output
from pathlib import Path
from os import getenv
import re

ruta_exe = Path(getenv("PATH_EXE") or "cli.exe")

def procesar_producto_cartesiano(conjunto:list):
    resultado = check_output([ruta_exe, "prod", f'({",".join(conjunto)})']).decode('utf-8')
    resultado = resultado[resultado.find('}') + 1: ].strip()
    print(resultado)
    return [re.findall(r'\((.*?)\)', fila.strip()) for fila in resultado.split('\n')]

def clasificar_R(conjunto:list, relacion:list) -> list:
    arg_conjunto = f'({",".join(conjunto)})'
    arg_relacion = f"{tuple(e for e in relacion)}".replace("'", "").replace(" ", "")
    resultado = check_output([ruta_exe, "clasificar", '-conjunto', arg_conjunto, '-r', arg_relacion]).decode('utf-8')
    print(resultado)
    return resultado
    