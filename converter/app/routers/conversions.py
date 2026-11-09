# app/routers/conversions.py
# Production File Transformation Engine for peoplepulse.online
# Resolves Frontend Pipeline Timeout Errors Across All 4 Tools

from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import uuid
import asyncio
import os
import io
from PIL import Image
from pypdf import PdfReader, PdfWriter

router = APIRouter(prefix="/api/v1/pipeline", tags=["File Conversions Engine"])

STORAGE_DIR = "/tmp/peoplepulse_storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

async_task_state_registry = {}


async def execute_asynchronous_python_conversion(task_id: str, tool_route: str, file_bytes: bytes,
                                                 original_filename: str):
    """
    Asynchronous task engine worker.
    Processes file transformations securely in a separate thread.
    """
    try:
        # Simulate processing duration drag for asynchronous loop updates
        await asyncio.sleep(2)

        # 1. Establish output format targets based on route signatures
        output_ext = "jpg" if tool_route == "heic-to-jpg" else "json" if tool_route == "csv-to-json" else "pdf"
        output_file_name = f"processed_{task_id}.{output_ext}"
        output_file_path = os.path.join(STORAGE_DIR, output_file_name)

        # -------------------------------------------------------------------------
        # 🛠️ MULTI-FORMAT COMPUTATION LOGIC FOR ALL 4 TOOLS
        # -------------------------------------------------------------------------

        # --- TOOL 1: MERGE PDF ---
        if tool_route == "merge-pdf":
            writer = PdfWriter()
            input_stream = io.BytesIO(file_bytes)
            reader = PdfReader(input_stream)
            writer.append(reader)

            with open(output_file_path, "wb") as f:
                writer.write(f)
            writer.close()

        # --- TOOL 2: HEIC TO JPG ---
        elif tool_route == "heic-to-jpg":
            from pillow_heif import register_heif_opener
            register_heif_opener()

            input_stream = io.BytesIO(file_bytes)
            with Image.open(input_stream) as img:
                img.convert("RGB").save(output_file_path, "JPEG", quality=90)

        # --- TOOL 3: COMPRESS PDF ---
        elif tool_route == "compress-pdf":
            input_stream = io.BytesIO(file_bytes)
            reader = PdfReader(input_stream)
            writer = PdfWriter()

            # Compress content vectors sequentially to reduce layout footprints
            for page in reader.pages:
                page.compress_content_streams()
                writer.add_page(page)

            with open(output_file_path, "wb") as f:
                writer.write(f)
            writer.close()

        # --- TOOL 4: CSV TO JSON ---
        elif tool_route == "csv-to-json":
            import pandas as pd
            # FIX: Convert raw byte array string into a valid UTF-8 text string wrapper for Pandas
            csv_text_string = file_bytes.decode("utf-8", errors="ignore")
            string_buffer = io.StringIO(csv_text_string)

            dataframe = pd.read_csv(string_buffer)
            dataframe.to_json(output_file_path, orient="records", indent=2)

        # --- NEW TOOL 5: APACHE PARQUET TO CSV PIPELINE ---
        elif tool_route == "parquet-to-csv":
            import pandas as pd
            # Ingest binary columnar data chunks directly into a Pandas dataframe engine
            bytes_buffer = io.BytesIO(file_bytes)

            # Reads parquet schemas seamlessly using pyarrow/fastparquet
            dataframe = pd.read_parquet(bytes_buffer, engine="auto")

            # Flatten columns out into a standard tabular comma-separated file format string
            dataframe.to_csv(output_file_path, index=False)

        else:
            raise ValueError(f"Target conversion engine slug not recognized: {tool_route}")

        # Map clean completion metrics parameters back onto state registry tracking logs
        async_task_state_registry[task_id] = {
            "status": "SUCCESS",
            "download_target": f"http://localhost:8000/api/v1/pipeline/download/{task_id}/{output_file_name}"
        }

    except Exception as e:
        # Catch and record errors securely to prevent frontend connection hanging timeouts
        async_task_state_registry[task_id] = {
            "status": "FAILED",
            "error": str(e)
        }


@router.post("/ingest/{tool_route}")
async def accept_binary_ingestion_stream(tool_route: str, background_tasks: BackgroundTasks,
                                         file: UploadFile = File(...)):
    """
    Ingests multipart data packets securely.
    Saves binary bytes into memory before passing to independent thread loops.
    """
    task_id = str(uuid.uuid4())
    async_task_state_registry[task_id] = {"status": "PROCESSING"}

    # FIX: Explicitly read raw payload data array bytes here
    file_bytes_payload = await file.read()

    # Pass the standalone byte object safely into background computation worker threads
    background_tasks.add_task(
        execute_asynchronous_python_conversion,
        task_id,
        tool_route,
        file_bytes_payload,
        file.filename
    )

    # Return 202 Accepted immediately to keep the Next.js UI fluid and responsive
    return JSONResponse(status_code=202, content={"status": "QUEUED", "task_id": task_id})


@router.get("/status/{task_id}")
async def query_pipeline_status(task_id: str):
    """Fast lookup path for React component polling interval tracking loops."""
    task_record = async_task_state_registry.get(task_id)
    if not task_record:
        raise HTTPException(status_code=404, detail="Requested tracking task ticket expired or invalid.")
    return task_record


@router.get("/download/{task_id}/{filename}")
async def deliver_processed_file(task_id: str, filename: str):
    """Streams physical generated file bytes back down the network connection pipeline."""
    target_path = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="The requested document file could not be found on disk.")

    media_type = "application/json" if filename.endswith(".json") else "image/jpeg" if filename.endswith(
        ".jpg") else "application/pdf"

    return FileResponse(
        path=target_path,
        media_type=media_type,
        filename=f"peoplepulse_{filename}"
    )
