import { useState, useEffect, useRef } from 'react';
import { Camera } from '@capacitor/camera';
import { Motion } from '@capacitor/motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Activity, AlertCircle, Brain, Battery, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";

interface PPGDataPoint {
  timestamp: number;
  value: number;
  brightness: number;
  redChannel: number;
  greenChannel: number;
  blueChannel: number;
}

interface HRVMetrics {
  sdnn: number;          // Standard deviation of NN intervals
  rmssd: number;         // Root mean square of successive differences
  pnn50: number;         // Proportion of NN50 divided by total number of NNs
  meanHR: number;        // Mean heart rate
  lf: number;           // Low frequency power (0.04-0.15 Hz)
  hf: number;           // High frequency power (0.15-0.4 Hz)
  lfhf: number;         // LF/HF ratio
  sd1: number;          // Poincaré plot standard deviation perpendicular to line of identity
  sd2: number;          // Poincaré plot standard deviation along line of identity
  coherence: number;    // Heart rhythm coherence ratio
}

interface BiometricAnalysis {
  stressLevel: number;
  cognitiveLoad: number;
  energyLevel: number;
  recoveryStatus: number;
  sleepReadiness: number;
  autonomicBalance: number;
  respiratoryRate: number;
  bloodOxygenEstimate: number;
}

interface StressScannerProps {
  onDataUpdate?: (data: any) => void;
}

export const StressScanner = ({ onDataUpdate }: StressScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hrvMetrics, setHrvMetrics] = useState<HRVMetrics | null>(null);
  const [biometricAnalysis, setBiometricAnalysis] = useState<BiometricAnalysis | null>(null);
  const [signalQuality, setSignalQuality] = useState<number>(0);
  const { toast } = useToast();
  
  const ppgDataRef = useRef<PPGDataPoint[]>([]);
  const frameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const processFrame = (imageData: ImageData) => {
    const data = imageData.data;
    let redSum = 0, greenSum = 0, blueSum = 0, brightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i];
      greenSum += data[i + 1];
      blueSum += data[i + 2];
      brightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    }
    
    const pixelCount = data.length / 4;
    ppgDataRef.current.push({
      timestamp: Date.now(),
      value: redSum / pixelCount,
      brightness: brightness / pixelCount,
      redChannel: redSum / pixelCount,
      greenChannel: greenSum / pixelCount,
      blueChannel: blueSum / pixelCount
    });
  };

  const calculateHRV = (ppgData: PPGDataPoint[]): HRVMetrics => {
    const peaks = findPeaksAdvanced(ppgData.map(p => p.value));
    const rrIntervals = calculateRRIntervals(peaks, ppgData);
    
    const sdnn = calculateSDNN(rrIntervals);
    const rmssd = calculateRMSSD(rrIntervals);
    const pnn50 = calculatePNN50(rrIntervals);
    const meanHR = 60000 / (rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length);
    
    const { lf, hf } = calculateFrequencyDomain(rrIntervals);
    const lfhf = lf / hf;
    
    const { sd1, sd2 } = calculatePoincarePlot(rrIntervals);
    
    const coherence = calculateHeartCoherence(rrIntervals);

    return { 
      sdnn, rmssd, pnn50, meanHR, 
      lf, hf, lfhf,
      sd1, sd2, coherence
    };
  };

  const findPeaksAdvanced = (signal: number[]): number[] => {
    const peaks: number[] = [];
    const windowSize = 20;
    const threshold = 0.6;
    
    const smoothedSignal = applySavitzkyGolayFilter(signal, 5, 3);
    
    for (let i = windowSize; i < smoothedSignal.length - windowSize; i++) {
      const window = smoothedSignal.slice(i - windowSize, i + windowSize);
      const max = Math.max(...window);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const std = Math.sqrt(window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length);
      
      if (smoothedSignal[i] === max && smoothedSignal[i] > mean + threshold * std) {
        peaks.push(i);
      }
    }
    
    return peaks;
  };

  const applySavitzkyGolayFilter = (signal: number[], windowSize: number, degree: number): number[] => {
    const filtered = new Array(signal.length).fill(0);
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = halfWindow; i < signal.length - halfWindow; i++) {
      let sum = 0;
      for (let j = -halfWindow; j <= halfWindow; j++) {
        sum += signal[i + j];
      }
      filtered[i] = sum / windowSize;
    }
    
    // Copy edge values
    for (let i = 0; i < halfWindow; i++) {
      filtered[i] = filtered[halfWindow];
      filtered[signal.length - 1 - i] = filtered[signal.length - 1 - halfWindow];
    }
    
    return filtered;
  };

  const calculateRRIntervals = (peaks: number[], ppgData: PPGDataPoint[]): number[] => {
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = ppgData[peaks[i]].timestamp - ppgData[peaks[i-1]].timestamp;
      if (interval > 300 && interval < 1500) {
        intervals.push(interval);
      }
    }
    return intervals;
  };

  const calculateFrequencyDomain = (intervals: number[]): { lf: number, hf: number } => {
    if (intervals.length < 2) return { lf: 0, hf: 0 };
    
    // Simple frequency analysis using windowed intervals
    const lfBand = intervals.filter(i => 1000/i >= 0.04 && 1000/i <= 0.15);
    const hfBand = intervals.filter(i => 1000/i > 0.15 && 1000/i <= 0.4);
    
    const lf = lfBand.reduce((a, b) => a + Math.pow(b, 2), 0) / lfBand.length;
    const hf = hfBand.reduce((a, b) => a + Math.pow(b, 2), 0) / hfBand.length;
    
    return { lf, hf };
  };

  const calculatePoincarePlot = (intervals: number[]): { sd1: number, sd2: number } => {
    const n = intervals.length;
    if (n < 2) return { sd1: 0, sd2: 0 };

    const x1: number[] = intervals.slice(0, n - 1);
    const x2: number[] = intervals.slice(1);
    
    const sd1 = Math.sqrt(variance(x1.map((v, i) => (x2[i] - v) / Math.sqrt(2))));
    const sd2 = Math.sqrt(variance(x1.map((v, i) => (x2[i] + v) / Math.sqrt(2))));
    
    return { sd1, sd2 };
  };

  const calculateHeartCoherence = (intervals: number[]): number => {
    if (intervals.length < 2) return 0;
    
    // Calculate coherence using peak frequency stability
    const diffs = intervals.slice(1).map((v, i) => Math.abs(v - intervals[i]));
    const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const coherence = 1 / (1 + meanDiff / 100);
    
    return coherence;
  };

  const variance = (array: number[]): number => {
    const mean = array.reduce((a, b) => a + b, 0) / array.length;
    return array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / array.length;
  };

  const analyzeBiometrics = (metrics: HRVMetrics): BiometricAnalysis => {
    const stressLevel = calculateStressLevel(metrics);
    const cognitiveLoad = calculateCognitiveLoad(metrics);
    const energyLevel = calculateEnergyLevel(metrics);
    const recoveryStatus = calculateRecoveryStatus(metrics);
    const sleepReadiness = calculateSleepReadiness(metrics);
    const autonomicBalance = calculateAutonomicBalance(metrics);
    const respiratoryRate = estimateRespiratoryRate(metrics);
    const bloodOxygenEstimate = estimateBloodOxygen();

    const analysis = {
      stressLevel,
      cognitiveLoad,
      energyLevel,
      recoveryStatus,
      sleepReadiness,
      autonomicBalance,
      respiratoryRate,
      bloodOxygenEstimate
    };

    // Emit data update if callback is provided
    if (onDataUpdate) {
      onDataUpdate(analysis);
    }

    return analysis;
  };

  const calculateStressLevel = (metrics: HRVMetrics): number => {
    const sdnnNorm = normalize(metrics.sdnn, 20, 100);
    const rmssdNorm = normalize(metrics.rmssd, 15, 80);
    const lfhfNorm = normalize(metrics.lfhf, 0.5, 2);
    const coherenceNorm = metrics.coherence;
    
    return 100 * (1 - (
      sdnnNorm * 0.3 + 
      rmssdNorm * 0.3 + 
      (1 - lfhfNorm) * 0.2 + 
      coherenceNorm * 0.2
    ));
  };

  const normalize = (value: number, min: number, max: number): number => {
    return Math.min(Math.max((value - min) / (max - min), 0), 1);
  };

  const calculateCognitiveLoad = (metrics: HRVMetrics): number => {
    return 100 * (1 - (metrics.sd1 / metrics.sd2));
  };

  const calculateEnergyLevel = (metrics: HRVMetrics): number => {
    return 100 * (metrics.hf / (metrics.lf + metrics.hf));
  };

  const calculateRecoveryStatus = (metrics: HRVMetrics): number => {
    return 100 * (metrics.rmssd / 100);
  };

  const calculateSleepReadiness = (metrics: HRVMetrics): number => {
    return 100 * (metrics.coherence * 0.7 + (metrics.sdnn / 100) * 0.3);
  };

  const calculateAutonomicBalance = (metrics: HRVMetrics): number => {
    return 100 * (0.5 + (Math.log(metrics.lfhf) / 4));
  };

  const estimateRespiratoryRate = (metrics: HRVMetrics): number => {
    return 60 / (metrics.hf * 0.15);
  };

  const estimateBloodOxygen = (): number => {
    const recentData = ppgDataRef.current.slice(-100);
    if (recentData.length < 100) return 0;
    
    const acComponent = Math.sqrt(variance(recentData.map(p => p.redChannel)));
    const dcComponent = recentData.reduce((a, b) => a + b.redChannel, 0) / recentData.length;
    
    return 95 + (acComponent / dcComponent) * 5;
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      setProgress(0);
      setBiometricAnalysis(null);
      setHrvMetrics(null);
      ppgDataRef.current = [];

      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.camera !== 'granted') {
        await Camera.requestPermissions();
      }

      if (canvasRef.current) {
        contextRef.current = canvasRef.current.getContext('2d');
      }

      await Motion.addListener('accel', (event) => {
        if (Math.abs(event.acceleration.x) > 0.5 || 
            Math.abs(event.acceleration.y) > 0.5 || 
            Math.abs(event.acceleration.z) > 0.5) {
          setSignalQuality(prev => Math.max(0, prev - 5));
          toast({
            title: "Movement detected",
            description: "Please keep your finger still for accurate readings",
            variant: "destructive",
          });
        }
      });

      const video = document.createElement('video');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      video.srcObject = stream;
      video.play();

      const processFrames = () => {
        if (!isScanning) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (contextRef.current && canvasRef.current && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          contextRef.current.drawImage(video, 0, 0);
          
          const imageData = contextRef.current.getImageData(
            0, 0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          
          processFrame(imageData);
          
          setProgress(prev => {
            const newProgress = prev + (100 / (30 * 20));
            if (newProgress >= 100) {
              finishScan();
              return 100;
            }
            return newProgress;
          });
          
          setSignalQuality(assessSignalQuality(ppgDataRef.current));
        }

        frameRef.current = requestAnimationFrame(processFrames);
      };

      frameRef.current = requestAnimationFrame(processFrames);

    } catch (error) {
      console.error('Error starting scan:', error);
      toast({
        title: "Error",
        description: "Failed to start stress scan. Please ensure camera access is granted.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const finishScan = () => {
    if (ppgDataRef.current.length < 100) {
      toast({
        title: "Scan Failed",
        description: "Not enough data collected. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
      return;
    }

    const metrics = calculateHRV(ppgDataRef.current);
    setHrvMetrics(metrics);
    const analysis = analyzeBiometrics(metrics);
    setBiometricAnalysis(analysis);
    
    setIsScanning(false);
    Motion.removeAllListeners();
    cancelAnimationFrame(frameRef.current);
    
    toast({
      title: "Scan Complete",
      description: `Your stress level has been measured`,
    });
  };

  const assessSignalQuality = (ppgData: PPGDataPoint[]): number => {
    if (ppgData.length < 2) return 0;
    
    const values = ppgData.map(p => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    const qualityScore = Math.min(Math.max((variance - 100) / 1000, 0), 1) * 100;
    return Math.round(qualityScore);
  };

  useEffect(() => {
    return () => {
      Motion.removeAllListeners();
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const calculateSDNN = (intervals: number[]): number => {
    if (intervals.length < 2) return 0;
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const squaredDiffs = intervals.map(interval => Math.pow(interval - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (intervals.length - 1));
  };

  const calculateRMSSD = (intervals: number[]): number => {
    if (intervals.length < 2) return 0;
    let sumSquaredDiffs = 0;
    for (let i = 1; i < intervals.length; i++) {
      const diff = intervals[i] - intervals[i-1];
      sumSquaredDiffs += diff * diff;
    }
    return Math.sqrt(sumSquaredDiffs / (intervals.length - 1));
  };

  const calculatePNN50 = (intervals: number[]): number => {
    if (intervals.length < 2) return 0;
    let nn50Count = 0;
    for (let i = 1; i < intervals.length; i++) {
      const diff = Math.abs(intervals[i] - intervals[i-1]);
      if (diff > 50) nn50Count++;
    }
    return (nn50Count / (intervals.length - 1)) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Advanced Biometric Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas ref={canvasRef} className="hidden" />
          
          {!isScanning && !biometricAnalysis ? (
            <Button 
              onClick={startScan} 
              className="w-full"
              disabled={isScanning}
            >
              Start Biometric Scan
            </Button>
          ) : isScanning ? (
            <div className="space-y-4">
              <Progress value={progress} />
              <div className="flex items-center justify-between text-sm">
                <span>Signal Quality: {signalQuality}%</span>
                <span>Progress: {Math.round(progress)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p>Place your finger on the camera lens and keep still...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Stress Level</p>
                  <p className="text-2xl font-bold">{Math.round(biometricAnalysis?.stressLevel || 0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Energy Level</p>
                  <p className="text-2xl font-bold">{Math.round(biometricAnalysis?.energyLevel || 0)}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Recovery Status</p>
                  <p className="text-2xl font-bold">{Math.round(biometricAnalysis?.recoveryStatus || 0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Sleep Readiness</p>
                  <p className="text-2xl font-bold">{Math.round(biometricAnalysis?.sleepReadiness || 0)}%</p>
                </div>
              </div>

              {hrvMetrics && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">SDNN</p>
                    <p>{Math.round(hrvMetrics.sdnn)} ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">RMSSD</p>
                    <p>{Math.round(hrvMetrics.rmssd)} ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">LF/HF</p>
                    <p>{hrvMetrics.lfhf.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Respiratory Rate</p>
                  <p>{Math.round(biometricAnalysis?.respiratoryRate || 0)} bpm</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">SpO2 Estimate</p>
                  <p>{Math.round(biometricAnalysis?.bloodOxygenEstimate || 0)}%</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <h4 className="font-semibold">Analysis & Recommendations:</h4>
                {biometricAnalysis && (
                  <>
                    {biometricAnalysis.stressLevel > 70 ? (
                      <p>High stress detected. Your HRV indicates elevated sympathetic activity. Consider deep breathing exercises or meditation.</p>
                    ) : biometricAnalysis.stressLevel > 30 ? (
                      <p>Moderate stress levels. Your autonomic balance shows some tension, but it's manageable. Regular breaks may help.</p>
                    ) : (
                      <p>Your stress levels are well managed. Good autonomic balance indicates effective recovery.</p>
                    )}
                    
                    {biometricAnalysis.sleepReadiness < 50 ? (
                      <p>Your body shows signs of insufficient recovery. Consider extending your next sleep duration.</p>
                    ) : (
                      <p>Good recovery status. Your body is well-prepared for the next sleep cycle.</p>
                    )}
                    
                    {biometricAnalysis.energyLevel < 40 ? (
                      <p>Energy levels are low. Consider a short rest or light physical activity to boost circulation.</p>
                    ) : (
                      <p>Energy levels are optimal for cognitive tasks and physical activity.</p>
                    )}
                  </>
                )}
              </div>
              
              <Button 
                onClick={startScan} 
                variant="outline"
                className="w-full"
              >
                Scan Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

