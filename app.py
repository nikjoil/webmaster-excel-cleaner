from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import tempfile


from cleaner import analyze_and_process_file

app = Flask(__name__)

CORS(app)

TEMP_DIR = tempfile.gettempdir()


@app.route('/upload', methods=['POST'])
def upload_and_analyze():
    if 'file' not in request.files:
        return jsonify({"error": "Файл не отправлен"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Файл не выбран"}), 400

    try:
        df = pd.read_excel(file)

        result_package = analyze_and_process_file(df)

        temp_filename = f"processed_{os.urandom(8).hex()}.xlsx"
        temp_filepath = os.path.join(TEMP_DIR, temp_filename)

        result_package["full_data"].to_excel(temp_filepath, index=False)

        response_data = {
            "stats": result_package["stats"],
            "available_dates": result_package["available_dates"],
            "data_preview": result_package["data_preview"],
            "download_token": temp_filename
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": f"Произошла ошибка: {str(e)}"}), 500


@app.route('/download/<token>')
def download_processed_file(token):

    filepath = os.path.join(TEMP_DIR, token)
    if os.path.exists(filepath):
        return send_file(
            filepath,
            download_name='Yandex_Webmaster_Cleaned.xlsx',
            as_attachment=True
        )
    return jsonify({"error": "Файл не найден или срок его хранения истек"}), 404


if __name__ == '__main__':
    app.run(debug=True)
