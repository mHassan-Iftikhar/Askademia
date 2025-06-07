declare module 'face-api.js' {
  export const nets: {
    tinyFaceDetector: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceLandmark68Net: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceRecognitionNet: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceExpressionNet: {
      loadFromUri: (uri: string) => Promise<void>;
    };
  };

  export class TinyFaceDetectorOptions {
    constructor(options?: {
      inputSize?: number;
      scoreThreshold?: number;
    });
  }

  export function detectAllFaces(
    input: HTMLVideoElement | HTMLImageElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks: () => {
      withFaceExpressions: () => Promise<Array<{
        detection: {
          box: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
        };
      }>>;
    };
  };

  export function matchDimensions(
    canvas: HTMLCanvasElement,
    dimensions: { width: number; height: number }
  ): void;

  export function resizeResults(
    detections: any[],
    dimensions: { width: number; height: number }
  ): any[];

  export const draw: {
    drawFaceLandmarks: (canvas: HTMLCanvasElement, detections: any[]) => void;
    drawFaceExpressions: (canvas: HTMLCanvasElement, detections: any[]) => void;
  };
} 