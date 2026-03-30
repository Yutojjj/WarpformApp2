import os
import gspread
import traceback
import shutil
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.oauth2.service_account import Credentials
import uvicorn

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
IMAGE_FOLDER_NAME = "Images_Storage"
IMAGE_DIR = os.path.join(BASE_DIR, IMAGE_FOLDER_NAME)

if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

app.mount(f"/{IMAGE_FOLDER_NAME}", StaticFiles(directory=IMAGE_DIR), name="images")

def get_spreadsheet():
    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    # credentials.jsonは同じディレクトリに配置
    creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
    client = gspread.authorize(creds)
    return client.open("キャスト管理名簿") # スプレッドシート名

@app.get("/search")
async def search_data(q: str = "", type: str = "キャスト"):
    try:
        sh = get_spreadsheet()
        sheet_name = "キャストエントリーシート" if type == "キャスト" else "社員/アルバイト面接書"
        worksheet = sh.worksheet(sheet_name)
        data = worksheet.get_all_records()
        
        if q:
            filtered = [r for r in data if q in str(r.values())]
            return filtered
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update_data")
async def update_data(request: Request):
    try:
        updated_person = await request.json()
        target_name = updated_person.get("お名前")
        sheet_type = updated_person.get("シート区分")
        
        sh = get_spreadsheet()
        sheet_name = "キャストエントリーシート" if sheet_type == "キャスト" else "社員/アルバイト面接書"
        worksheet = sh.worksheet(sheet_name)
        
        headers = worksheet.row_values(1)
        name_col_index = headers.index("お名前") + 1
        name_column_data = worksheet.col_values(name_col_index)
        
        if target_name not in name_column_data:
            raise HTTPException(status_code=404, detail="User not found")
            
        row_index = name_column_data.index(target_name) + 1
        cells_to_update = []
        
        for key, value in updated_person.items():
            if key in headers and key not in ["お名前", "シート区分"]:
                col_index = headers.index(key) + 1
                cells_to_update.append(gspread.Cell(row_index, col_index, value))
        
        if cells_to_update:
            worksheet.update_cells(cells_to_update)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_image")
async def upload_image(file: UploadFile = File(...), person_name: str = Form(...)):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{person_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}{file_extension}"
        file_path = os.path.join(IMAGE_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"image_path": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
