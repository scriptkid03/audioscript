from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import assemblyai as aai
import os
from dotenv import load_dotenv
import re
from tempfile import NamedTemporaryFile
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://audioscript-rho.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check AssemblyAI API key
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")
if not aai.settings.api_key:
    logger.error("API key is missing! Please check your .env file")
    raise ValueError("API key is missing! Please check your .env file")

transcriber = aai.Transcriber()

@app.post("/transcribe/file")
async def transcribe_file(file: UploadFile = File(...), language: str = "en"):
    try:
        logger.info(f"Received file: {file.filename}, language: {language}")
        
        # Create temp file with proper extension
        file_extension = os.path.splitext(file.filename)[1]
        
        with NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            logger.info(f"Created temporary file: {temp_file.name}")
            
            # Read and write the file content
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            
            logger.info("File saved successfully, starting transcription")
            
            try:
                config = aai.TranscriptionConfig(language_code=language)
                transcript = transcriber.transcribe(temp_file_path, config=config)
                
                logger.info("Transcription completed successfully")
                
                if not transcript or not transcript.text:
                    raise ValueError("No transcription result received")
                
                formatted_transcript = format_transcript_with_timestamps(transcript)
                
                return {
                    "text": transcript.text,
                    "formatted_text": formatted_transcript
                }
            
            except Exception as transcription_error:
                logger.error(f"Transcription error: {str(transcription_error)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Transcription failed: {str(transcription_error)}"
                )
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file_path)
                    logger.info("Temporary file cleaned up")
                except Exception as cleanup_error:
                    logger.error(f"Error cleaning up temp file: {str(cleanup_error)}")
                    
    except Exception as e:
        logger.error(f"General error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def format_transcript_with_timestamps(transcript):
    try:
        result = []
        word_index = 0
        sentences = re.split(r'(?<=[.!?]) +', transcript.text)

        for sentence in sentences:
            if word_index < len(transcript.words):
                start_time = transcript.words[word_index].start / 1000
                hours = int(start_time // 3600)
                minutes = int((start_time % 3600) // 60)
                seconds = int(start_time % 60)
                milliseconds = int((start_time % 1) * 1000)
                timestamp = f"{hours:02}:{minutes:02}:{seconds:02}.{milliseconds:03}"
                result.append(f"{timestamp} {sentence}")
                word_index += len(sentence.split())

        return "\n".join(result)
    except Exception as e:
        logger.error(f"Error formatting transcript: {str(e)}")
        raise