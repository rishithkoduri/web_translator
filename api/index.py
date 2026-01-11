from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator

app = Flask(__name__)

@app.route("/api/translate", methods=["POST"])
def translate_text():
    try:
        data = request.json
        text = data.get("text")
        target_lang = data.get("target_lang", "es")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Perform translation
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        
        return jsonify({"translated_text": translated})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel requires the app to be available as a variable
if __name__ == "__main__":
    app.run(debug=True, port=5328)