from flask import Flask, render_template, request, redirect, url_for
from cassandra.cluster import Cluster

app = Flask(__name__)

# Connect to Cassandra cluster
cluster = Cluster(['cassandra-node1', 'cassandra-node2', 'cassandra-node3'])
session = cluster.connect()

# Define keyspace and table names
keyspace = 'hospital'
table_name = 'patients'

# Home page - Welcome message
@app.route('/')
def home():
    return 'Welcome to Ntsoekhe Distributed Database Management System!'

# Route to display all patients
@app.route('/patients')
def list_patients():
    query = f"SELECT * FROM {keyspace}.{table_name}"
    rows = session.execute(query)
    patients = [dict(row) for row in rows]
    return render_template('patients.html', patients=patients)

# Route to add a new patient
@app.route('/add_patient', methods=['GET', 'POST'])
def add_patient():
    if request.method == 'POST':
        # Retrieve form data
        patient_id = request.form['patient_id']
        name = request.form['name']
        age = int(request.form['age'])
        gender = request.form['gender']
        # Insert new patient into the database
        query = f"INSERT INTO {keyspace}.{table_name} (patient_id, name, age, gender) VALUES (%s, %s, %s, %s)"
        session.execute(query, (patient_id, name, age, gender))
        return redirect(url_for('list_patients'))
    return render_template('add_patient.html')

# Route to update patient information
@app.route('/update_patient/<patient_id>', methods=['GET', 'POST'])
def update_patient(patient_id):
    if request.method == 'POST':
        # Retrieve updated form data
        name = request.form['name']
        age = int(request.form['age'])
        gender = request.form['gender']
        # Update patient information in the database
        query = f"UPDATE {keyspace}.{table_name} SET name = %s, age = %s, gender = %s WHERE patient_id = %s"
        session.execute(query, (name, age, gender, patient_id))
        return redirect(url_for('list_patients'))
    # Retrieve patient details for pre-populating the update form
    query = f"SELECT * FROM {keyspace}.{table_name} WHERE patient_id = %s"
    row = session.execute(query, (patient_id,)).one()
    patient = dict(row)
    return render_template('update_patient.html', patient=patient)

# Route to delete a patient
@app.route('/delete_patient/<patient_id>')
def delete_patient(patient_id):
    query = f"DELETE FROM {keyspace}.{table_name} WHERE patient_id = %s"
    session.execute(query, (patient_id,))
    return redirect(url_for('list_patients'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
