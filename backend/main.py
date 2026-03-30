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



# スマホアプリからの通信を許可する設定

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



BASE_DIR = os.path.dirname(__file__)

IMAGE_FOLDER_NAME = "社員_アルバイト面接書_Images"

IMAGE_DIR = os.path.join(BASE_DIR, IMAGE_FOLDER_NAME)



if not os.path.exists(IMAGE_DIR):

    os.makedirs(IMAGE_DIR)



# 画像をURLで配信するための設定

app.mount(f"/{IMAGE_FOLDER_NAME}", StaticFiles(directory=IMAGE_DIR), name="images")



def get_spreadsheet():

    scopes = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

    creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)

    gc = gspread.authorize(creds)

    sh = gc.open_by_key("1s-MMS9JhIzOie3GfRA_DFkQ-1KphszhB0sQDf47ZG6s")

    return sh



@app.get("/search")

def search():

    try:

        sh = get_spreadsheet()

        result = []

        try:

            ws_staff = sh.worksheet("社員/アルバイト面接書")

            all_data_staff = ws_staff.get_all_values()

            if all_data_staff:

                headers = all_data_staff[0]

                for row in all_data_staff[1:]:

                    item = {headers[i]: row[i] if i < len(row) else "" for i in range(len(headers))}

                    item["シート区分"] = "スタッフ"

                    result.append(item)

        except Exception as e:

            print(f"スタッフシート取得エラー: {e}")

        try:

            ws_cast = sh.worksheet("キャストエントリーシート")

            all_data_cast = ws_cast.get_all_values()

            if all_data_cast:

                headers = all_data_cast[0]

                for row in all_data_cast[1:]:

                    item = {headers[i]: row[i] if i < len(row) else "" for i in range(len(headers))}

                    item["シート区分"] = "キャスト"

                    result.append(item)

        except Exception as e:

            print(f"キャストシート取得エラー: {e}")

        return {"status": "success", "data": result}

    except Exception as e:

        return {"status": "debug_error", "reason": str(e)}



@app.get("/get_image")

async def get_image(image_path: str):

    try:

        full_path = os.path.join(BASE_DIR, image_path.replace("\\", "/"))

        if not os.path.exists(full_path):

            raise HTTPException(status_code=404, detail="Image not found")

        return FileResponse(full_path)

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))



@app.post("/upload_image")

async def upload_image(file: UploadFile = File(...), name: str = Form(...), sheet_type: str = Form(...)):

    try:

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        file_name = f"{timestamp}_photo.jpg"

        save_path = os.path.join(IMAGE_DIR, file_name)

        with open(save_path, "wb") as buffer:

            shutil.copyfileobj(file.file, buffer)

        saved_path = f"{IMAGE_FOLDER_NAME}/{file_name}"

        sh = get_spreadsheet()

        sheet_name = "キャストエントリーシート" if sheet_type == "キャスト" else "社員/アルバイト面接書"

        worksheet = sh.worksheet(sheet_name)

        headers = worksheet.row_values(1)

        name_col_index = headers.index("お名前") + 1

        photo_col_index = headers.index("顔写真") + 1

        name_column_data = worksheet.col_values(name_col_index)

        row_index = name_column_data.index(name) + 1

        worksheet.update_cell(row_index, photo_col_index, saved_path)

        return {"status": "success", "image_path": saved_path}

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

        row_index = name_column_data.index(target_name) + 1

        cells_to_update = []

        for key, value in updated_person.items():

            if key in headers and key != "お名前" and key != "シート区分":

                col_index = headers.index(key) + 1

                cells_to_update.append(gspread.Cell(row_index, col_index, value))

        if cells_to_update:

            worksheet.update_cells(cells_to_update)

        return {"status": "success"}

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))



@app.post("/delete_data")

async def delete_data(request: Request):

    try:

        data = await request.json()

        target_name = data.get("お名前")

        sheet_type = data.get("シート区分")

        sh = get_spreadsheet()

        sheet_name = "キャストエントリーシート" if sheet_type == "キャスト" else "社員/アルバイト面接書"

        worksheet = sh.worksheet(sheet_name)

        name_col_index = worksheet.row_values(1).index("お名前") + 1

        name_column_data = worksheet.col_values(name_col_index)

        row_index = name_column_data.index(target_name) + 1

        worksheet.delete_rows(row_index)

        return {"status": "success"}

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)