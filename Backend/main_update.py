## pip install git+https://github.com/googleapis/python-genai.git

import asyncio
import json
import os
import uuid
from google import genai
import base64
from google.genai import types
import websockets
from websockets.server import WebSocketServerProtocol
import io
from pydub import AudioSegment
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define the model to use
MODEL = "gemini-2.5-flash-preview-native-audio-dialog"

# Configure Google AI client with API key
client = genai.Client(
    api_key=os.getenv('GOOGLE_API_KEY')
)

# Track active connections
active_connections = set()

# Load previous session handle from a file
# You must delete the session_handle.json file to start a new session when last session was 
# finished for a while.
def load_previous_session_handle():
    try:
        with open('session_handle.json', 'r') as f:
            data = json.load(f)
            print(f"Loaded previous session handle: {data.get('previous_session_handle', None)}")
            return data.get('previous_session_handle', None)
    except FileNotFoundError:
        return None

# Save previous session handle to a file
def save_previous_session_handle(handle):
    with open('session_handle.json', 'w') as f:
        json.dump({'previous_session_handle': handle}, f)

previous_session_handle = load_previous_session_handle()

async def gemini_session_handler(websocket: WebSocketServerProtocol):
    print(f"Starting Gemini session")
    try:
        config_message = await websocket.recv()
        config_data = json.loads(config_message)

        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    #Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, and Zephyr.
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
                ),
                language_code='en-US',
            ),
            system_instruction="You are a helpful assistant.",
            session_resumption=types.SessionResumptionConfig(
                # The handle of the session to resume is passed here,
                # or else None to start a new session.
                handle=previous_session_handle
            ),
            output_audio_transcription=types.AudioTranscriptionConfig(
                
            ),
            
        )

        async with client.aio.live.connect(model=MODEL, config=config) as session:
            #print(f"Connected to Gemini API with handle: {previous_session_handle}")

            async def send_to_gemini():
                try:
                    async for message in websocket:
                        try:
                            data = json.loads(message)
                            
                            if "realtime_input" in data:
                                for chunk in data["realtime_input"]["media_chunks"]:
                                    if chunk["mime_type"] == "audio/pcm":
                                        await session.send(input={
                                            "mime_type": "audio/pcm",
                                            "data": chunk["data"]
                                        })
                                        #print(f"Sent audio to Gemini: {chunk['data'][:32]}...")
                                    
                                    elif chunk["mime_type"].startswith("image/"):
                                        await session.send(input={
                                            "mime_type": chunk["mime_type"],
                                            "data": chunk["data"]
                                        })
                            
                            elif "text" in data:
                                text_content = data["text"]
                                await session.send(input={
                                    "mime_type": "text/plain",
                                    "data": text_content
                                })
                                
                        except Exception as e:
                            print(f"Error sending to Gemini: {e}")
                    print("Client connection closed (send)")
                except Exception as e:
                    print(f"Error sending to Gemini: {e}")
                finally:
                    print("send_to_gemini closed")

            async def receive_from_gemini():
                try:
                    while True:
                        try:
                            print("receiving from gemini")
                            async for response in session.receive():
                                if response.server_content and hasattr(response.server_content, 'interrupted') and response.server_content.interrupted is not None:
                                    print(f"[{datetime.datetime.now()}] Generation interrupted")
                                    await websocket.send(json.dumps({"interrupted": "True"}))
                                    continue

                                if response.usage_metadata:
                                    usage = response.usage_metadata
                                    print(
                                        f'Used {usage.total_token_count} tokens in total.'
                                    )

                                if response.session_resumption_update:
                                    update = response.session_resumption_update
                                    if update.resumable and update.new_handle:
                                        # The handle should be retained and linked to the session.
                                        previous_session_handle = update.new_handle
                                        save_previous_session_handle(previous_session_handle)
                                        print(f"Resumed session update with handle: {previous_session_handle}")

                                if response.server_content and hasattr(response.server_content, 'output_transcription') and response.server_content.output_transcription is not None:
                                    await websocket.send(json.dumps({
                                        "transcription": {
                                            "text": response.server_content.output_transcription.text,
                                            "sender": "Gemini",
                                            "finished": response.server_content.output_transcription.finished
                                        }
                                    }))
                                if response.server_content and hasattr(response.server_content, 'input_transcription') and response.server_content.input_transcription is not None:
                                    await websocket.send(json.dumps({
                                        "transcription": {
                                            "text": response.server_content.input_transcription.text,
                                            "sender": "User",
                                            "finished": response.server_content.input_transcription.finished
                                        }
                                    }))

                                if response.server_content is None:
                                    continue
                                    
                                model_turn = response.server_content.model_turn
                                if model_turn:
                                    for part in model_turn.parts:
                                        if hasattr(part, 'text') and part.text is not None:
                                            await websocket.send(json.dumps({"text": part.text}))
                                        
                                        elif hasattr(part, 'inline_data') and part.inline_data is not None:
                                            try:
                                                audio_data = part.inline_data.data
                                                base64_audio = base64.b64encode(audio_data).decode('utf-8')
                                                await websocket.send(json.dumps({
                                                    "audio": base64_audio,
                                                }))
                                                #print(f"Sent assistant audio to client: {base64_audio[:32]}...")
                                            except Exception as e:
                                                print(f"Error processing assistant audio: {e}")

                                if response.server_content and response.server_content.turn_complete:
                                    print('\n<Turn complete>')
                                    await websocket.send(json.dumps({
                                        "transcription": {
                                            "text": "",
                                            "sender": "Gemini",
                                            "finished": True
                                        }
                                    }))
                                    
                        except websockets.exceptions.ConnectionClosedOK:
                            print("Client connection closed normally (receive)")
                            break
                        except Exception as e:
                            print(f"Error receiving from Gemini: {e}")
                            break

                except Exception as e:
                    print(f"Error receiving from Gemini: {e}")
                finally:
                    print("Gemini connection closed (receive)")

            # Start send and receive tasks
            send_task = asyncio.create_task(send_to_gemini())
            receive_task = asyncio.create_task(receive_from_gemini())
            await asyncio.gather(send_task, receive_task)

    except Exception as e:
        print(f"Error in Gemini session: {e}")
    finally:
        print("Gemini session closed.")
    
async def handle_client(websocket: WebSocketServerProtocol):
    try:
        print("New client connected")
        active_connections.add(websocket)
        # Delegate to the gemini_session_handler for all real-time interaction
        await gemini_session_handler(websocket)
    except websockets.exceptions.ConnectionClosedOK:
        print("Client connection closed normally.")
    except Exception as e:
        print(f"Error in handle_client: {e}")
    finally:
        print("Client disconnected.")
        active_connections.discard(websocket)

async def main():
    # Get configuration from environment variables
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8080))
    
    server = await websockets.serve(
        handle_client,
        host,
        port,
        ping_interval=20,  # Keep connection alive
        ping_timeout=20
    )
    print(f"Server started on ws://localhost:{port}")
    await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
