from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import os
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

# Configuraciones
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ruleta.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

db = SQLAlchemy(app)

# Modelo de base de datos
class Espacio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    imagen = db.Column(db.String(200), nullable=True)

with app.app_context():
    db.create_all()

# Función para validar el tipo de archivo
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Ruta principal
@app.route('/')
def home():
    espacios = Espacio.query.all()  # Obtener todos los espacios
    return render_template('index.html', espacios=espacios)

# Ruta para servir archivos estáticos
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Ruta para agregar o editar un espacio (con imagen)
@app.route('/agregar', methods=['POST'])
def agregar():
    espacio_id = request.form.get('id')
    nombre = request.form['nombre']
    imagen = request.files.get('imagen')

    if espacio_id:
        espacio = Espacio.query.get(espacio_id)
        if espacio:
            espacio.nombre = nombre
            if imagen and allowed_file(imagen.filename):
                filename = secure_filename(imagen.filename)
                imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                espacio.imagen = filename
    else:
        if imagen and allowed_file(imagen.filename):
            filename = secure_filename(imagen.filename)
            imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            nuevo_espacio = Espacio(nombre=nombre, imagen=filename)
            db.session.add(nuevo_espacio)

    db.session.commit()
    return redirect(url_for('home'))

# Ruta para eliminar un espacio
@app.route('/eliminar/<int:id>', methods=['POST'])
def eliminar(id):
    espacio = Espacio.query.get(id)
    if espacio:
        db.session.delete(espacio)
        db.session.commit()
    return redirect(url_for('home'))

# Ruta para obtener los espacios en formato JSON
@app.route('/espacios')
def obtener_espacios():
    espacios = Espacio.query.all()
    return jsonify([{"id": e.id, "nombre": e.nombre, "imagen": e.imagen} for e in espacios])

if __name__ == '__main__':
    app.run(debug=True)

# Configuración para Vercel
app.wsgi_app = ProxyFix(app.wsgi_app)

# Vercel handler function
def handler(event, context):
    return app.wsgi_app
