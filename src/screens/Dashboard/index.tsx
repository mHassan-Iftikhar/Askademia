import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MoreVertical, MessageSquare, Users } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import * as faceapi from 'face-api.js';

// TypeScript declarations for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Add MediaStreamTrack type
type MediaStreamTrack = {
  enabled: boolean;
  stop: () => void;
};

// Custom hook to detect mobile view
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

const Dashboard = () => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const desktopCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMobile = useIsMobile();

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      } catch (error) {
        console.error('Error loading face detection models:', error);
        setError('Failed to load face detection models');
      }
    };

    loadModels();
  }, []);

  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        console.log('User said:', transcript);
      };

      recognition.onerror = (event: Event) => {
        console.error('Speech recognition error:', event);
        setError('Speech recognition error. Please check your microphone.');
        if (isCallActive) {
          setTimeout(() => {
            recognition.start();
          }, 1000);
        }
      };

      recognition.onend = () => {
        console.log('Recognition ended, restarting...');
        if (isCallActive) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setError('Speech recognition is not available. Please use a supported browser.');
    }
  };

  const startMedia = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        audio: isMicOn,
        video: isCameraOn ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;

      // Update video elements
      if (mobileVideoRef.current) {
        mobileVideoRef.current.srcObject = newStream;
        await mobileVideoRef.current.play();
      }
      if (desktopVideoRef.current) {
        desktopVideoRef.current.srcObject = newStream;
        await desktopVideoRef.current.play();
      }

      // Set initial audio track state
      const audioTracks = newStream.getAudioTracks();
      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = isMicOn;
      });

      // Set initial video track state
      const videoTracks = newStream.getVideoTracks();
      videoTracks.forEach((track: { enabled: boolean; stop: () => void }) => {
        track.enabled = isCameraOn;
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Failed to access media devices");
    }
  };

  const toggleMic = async () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length === 0) {
        // If no audio tracks exist, get a new stream
        await startMedia();
      } else {
        audioTracks.forEach((track: MediaStreamTrack) => {
          track.enabled = newMicState;
        });
      }
    } else {
      await startMedia();
    }
  };

  const toggleCamera = async () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);
    
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length === 0 && newCameraState) {
        // If no video tracks exist and we're turning on the camera, get a new stream
        await startMedia();
      } else if (videoTracks.length > 0) {
        // If we have video tracks, just toggle them
        videoTracks.forEach((track: { enabled: boolean; stop: () => void }) => {
          track.enabled = newCameraState;
        });
      }
    } else if (newCameraState) {
      // If no stream exists and we're turning on the camera, get a new stream
      await startMedia();
    }
  };

  // Initialize media on component mount
  useEffect(() => {
    startMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Update media when camera or mic state changes
  useEffect(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const videoTracks = streamRef.current.getVideoTracks();

      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = isMicOn;
      });

      videoTracks.forEach((track: { enabled: boolean; stop: () => void }) => {
        track.enabled = isCameraOn;
      });
    }
  }, [isMicOn, isCameraOn]);

  // Face detection
  useEffect(() => {
    const videoElement = isMobile ? mobileVideoRef.current : desktopVideoRef.current;
    const canvasElement = isMobile ? mobileCanvasRef.current : desktopCanvasRef.current;
    
    if (!videoElement || !canvasElement) return;

    const detectFaces = async () => {
      if (videoElement && canvasElement) {
        const detections = await faceapi.detectAllFaces(
          videoElement,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();

        const displaySize = { width: videoElement.width, height: videoElement.height };
        faceapi.matchDimensions(canvasElement, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Draw face detection boxes
        resizedDetections.forEach(det => {
          const { x, y, width, height } = det.detection.box;
          ctx.strokeStyle = 'limegreen';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
        });
        faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasElement, resizedDetections);
      }
    };

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  }, [isCameraOn, isMobile]);

  useEffect(() => {
    if (isCallActive) {
      // Start timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Initialize speech recognition
      initializeSpeechRecognition();
    } else {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
      setError(null);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCall = () => {
    setIsCallActive(!isCallActive);
  };

  return (
    <DashboardLayout>
      {/* MOBILE VIEW */}
      {isMobile && (
        <div className="fixed inset-0 w-screen h-screen bg-white flex flex-col">
          {/* Camera in top right */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-100 rounded-lg overflow-hidden z-20">
            <video
              ref={mobileVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={mobileCanvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          {/* Caller Info and Buttons Centered */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {isCallActive ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center relative mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-8 bg-green-500 rounded-full"
                          style={{
                            animation: `wave 1s ease-in-out infinite ${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">Connected to AI Teacher</h2>
                <p className="text-gray-500 mb-4 text-center">You are in an active audio call</p>
                <p className="text-3xl font-semibold text-gray-800 mb-8 text-center">{formatTime(callDuration)}</p>
                {error && (
                  <div className="max-w-2xl bg-red-50 p-4 rounded-lg mb-4 text-center">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Start a Session</h2>
                  <p className="text-gray-500 mb-8">Click the call button to begin your AI teaching session</p>
                </div>
              </div>
            )}
          </div>
          {/* Control Bar at Bottom */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 absolute bottom-0 left-0 w-full">
            <div className="flex items-center gap-4 mx-auto">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full transition-colors ${
                  isMicOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isMicOn ? <Mic size={24} className="text-gray-600" /> : <MicOff size={24} className="text-white" />}
              </button>
              <button
                onClick={toggleCall}
                className={`p-3 rounded-full transition-colors ${
                  isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isCallActive ? <PhoneOff size={24} className="text-white" /> : <Phone size={24} className="text-white" />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full transition-colors ${
                  isCameraOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isCameraOn ? <Video size={24} className="text-gray-600" /> : <VideoOff size={24} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP VIEW */}
      {!isMobile && (
        <div className="flex flex-row gap-[30px] p-4">
          {/* Main Section */}
          <div className="flex-1 h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-gray-800 text-lg font-medium">AI Teacher Session</h2>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MessageSquare size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Users size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
              {isCallActive ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-8 bg-green-500 rounded-full"
                            style={{
                              animation: `wave 1s ease-in-out infinite ${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">Connected to AI Teacher</h2>
                  <p className="text-gray-500 mb-4 text-center">You are in an active audio call</p>
                  <p className="text-3xl font-semibold text-gray-800 mb-8 text-center">{formatTime(callDuration)}</p>
                  {error && (
                    <div className="max-w-2xl bg-red-50 p-4 rounded-lg mb-4 text-center">
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Start a Session</h2>
                    <p className="text-gray-500 mb-8">Click the call button to begin your AI teaching session</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Bar */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-4 mx-auto">
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full transition-colors ${
                    isMicOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isMicOn ? <Mic size={24} className="text-gray-600" /> : <MicOff size={24} className="text-white" />}
                </button>
                <button
                  onClick={toggleCall}
                  className={`p-3 rounded-full transition-colors ${
                    isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isCallActive ? <PhoneOff size={24} className="text-white" /> : <Phone size={24} className="text-white" />}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full transition-colors ${
                    isCameraOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isCameraOn ? <Video size={24} className="text-gray-600" /> : <VideoOff size={24} className="text-white" />}
                </button>
              </div>
            </div>
          </div>

          {/* Camera with Face Detection - Desktop View */}
          <div className="w-48 h-36 bg-gray-100 rounded-lg overflow-hidden relative">
            <video
              ref={desktopVideoRef}
              autoPlay
              playsInline
              muted
              width={192}
              height={144}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={desktopCanvasRef}
              width={192}
              height={144}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.5);
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard; 