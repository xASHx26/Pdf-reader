@echo off
echo Starting PDF Reader Flask Server...
echo.
echo Installing Python dependencies...
"E:/project/Pdf reader/.venv/Scripts/python.exe" -m pip install -r requirements.txt
echo.
echo Starting Flask server...
echo Open your browser and go to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
"E:/project/Pdf reader/.venv/Scripts/python.exe" app.py
