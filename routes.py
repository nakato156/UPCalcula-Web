from flask import Blueprint, render_template, request, send_file
from procesamiento import procesar_producto_cartesiano, clasificar_R
from hasse import graficar_hasse
from ast import literal_eval

routes_bp = Blueprint('routes_bp', __name__)

@routes_bp.get('/')
def index():
    return render_template('index.html')

@routes_bp.post('/producto')
def producto():
    data:dict = request.json 
    return procesar_producto_cartesiano(data)

@routes_bp.post('/clasificar')
def clasificar():
    data: dict = request.json
    relacion, conjunto = data.get("r"), data.get('conjunto')
    return { "resultado": clasificar_R(conjunto, relacion)}


@routes_bp.post('/diagrama')
def diagramar():
    data: dict = request.json
    conjunto = data.get('conjunto')
    relacion =  data.get('relacion')
    
    relacion[:] = [i.replace("(", "('").replace(",", "','").replace(")", "')").replace(" ", "") for i in relacion]
    relacion = [literal_eval(i) for i in relacion]
    
    ruta_diagrama = graficar_hasse(conjunto, relacion)
    print(ruta_diagrama)
    return send_file(ruta_diagrama, mimetype='image/png')