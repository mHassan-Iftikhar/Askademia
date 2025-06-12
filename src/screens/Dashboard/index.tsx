import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MessageSquare, Users } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import * as faceapi from 'face-api.js';
import { WebSocketProvider } from './WebSocketProvider';
import Chat from './Chat';
import ScreenShare from './ScreenShare';

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
  const [activeTab, setActiveTab] = useState<'chat' | 'screen'>('chat');
  
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
        console.log('Loading face detection models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        console.log('Face detection models loaded successfully');

        // Start face detection loop only after models are loaded
        const videoElement = isMobile ? mobileVideoRef.current : desktopVideoRef.current;
        const canvasElement = isMobile ? mobileCanvasRef.current : desktopCanvasRef.current;

        if (videoElement && canvasElement) {
          const interval = setInterval(async () => {
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
          }, 100);
          return () => clearInterval(interval);
        }

      } catch (error) {
        console.error('Error loading face detection models:', error);
      }
    };

    loadModels();
  }, [isMobile]);

  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;  // Changed to true to get interim results
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        console.log('User said:', transcript);
      };

      recognition.onerror = (event: Event) => {
        console.error('Speech recognition error:', event);
        if (isCallActive) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('Error restarting recognition:', e);
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        if (isCallActive) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
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
    <WebSocketProvider url="ws://localhost:9084">
      <DashboardLayout>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold">Askademia AI</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {isCameraOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
              </button>
              <button
                onClick={toggleCall}
                className={`p-2 rounded-full ${isCallActive ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {isCallActive ? <PhoneOff className="w-6 h-6 text-white" /> : <Phone className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Left Sidebar - Video Preview */}
            <div className="w-1/4 border-r p-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <video
                  ref={desktopVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={desktopCanvasRef}
                  className="absolute inset-0"
                />
              </div>
              {isCallActive && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500">
                    Call Duration: {formatTime(callDuration)}
                  </span>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Tab Navigation */}
              <div className="border-b">
                <nav className="flex space-x-4 p-4">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'chat'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 inline-block mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('screen')}
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'screen'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5 inline-block mr-2" />
                    Screen Share
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' ? (
                  <Chat />
                ) : (
                  <ScreenShare />
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
              {error}
            </div>
          )}
        </div>
      </DashboardLayout>
    </WebSocketProvider>
  );
};

export default Dashboard; 