import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import useSocketIO from "@/hooks/useWebSocket";
import SoundWave from "@/components/SoundWave";

export default function Bot() {
  const [responseText, setResponseText] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [metering, setMetering] = useState(-60);

  const SILENCE_THRESHOLD = 2000;
  const MIN_METERING = -40;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const audioDetectedRef = useRef(false); // Referencia para estado de audio detectado
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isSocketConnected, sendMessage } = useSocketIO(
    "http://10.0.0.95:3002/real-time-news",
    (message: string) => handleWebSocketMessage(message),
    (error: any) => console.error("WebSocket error:", error),
    () => console.log("WebSocket closed"),
  );

  const handleWebSocketMessage = async (data: string) => {
    try {
      const response = JSON.parse(data);
      console.log("WebSocket message received:", response);

      if (response.type === "audio" && response.data) {
        console.log("Audio file received. Attempting to play...");
        await playAudioFromUrl(response.data);
      } else if (response.type === "text") {
        setResponseText(response.text || "No response text received.");
      } else {
        console.warn("Unknown response type:", response.type);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message or playing audio:", error);
    }
  };

  const playAudioFromUrl = async (uri: string) => {
    console.log("Playing audio from response...");
    const { sound, status } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
    );

    try {
      await sound.playAsync();
      console.log("Audio is playing...");
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  };

  useEffect(() => {
    if (isSessionActive) {
      startRecording().then();
    } else {
      stopRecording(true).then();
    }
  }, [isSessionActive]);

  const handleRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
    if (!status.isRecording) return;

    if (status.mediaServicesDidReset) {
      console.log("Media services reset. Stopping recording...");
      stopRecording(true).then();
      return;
    }

    setMetering(status.metering || -60);

    if (status?.metering && status.metering > MIN_METERING) {
      // Audio detectado: Resetear el timeout
      console.log("Audio detected. Resetting silence timeout...");
      audioDetectedRef.current = true;

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else if (audioDetectedRef.current && !silenceTimeoutRef.current) {
      // Silencio detectado y no hay timeout activo
      console.log("Silence detected. Starting timeout...");
      const timeout = setTimeout(async () => {
        console.log("Silence timeout reached. Stopping recording...");
        if (!recordingRef.current) return;
        stopRecording(false).then(
          () => {
            console.log("Recording stopped successfully");
            // start recording again
            startRecording().then();
          },
          (error) => console.error("Failed to stop recording:", error),
        ); // Finalizar grabación actual
      }, SILENCE_THRESHOLD);
      silenceTimeoutRef.current = timeout;
    }
  };

  const startRecording = async () => {
    if (!isSessionActive || isRecording) return;

    try {
      console.log("Starting recording...");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Permission to access microphone is required!");
        return;
      }

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error: any) {
        console.error("Failed to set audio mode:", error);

        if (error.code === "E_AUDIO_NO_PERMISSION") {
          alert("Permission to access microphone is required!");
        }

        return;
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      newRecording.setOnRecordingStatusUpdate(handleRecordingStatusUpdate);
      await newRecording.startAsync();

      recordingRef.current = newRecording;
      setIsRecording(true);
      audioDetectedRef.current = false;

      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async (endSession: boolean = false) => {
    const currentRecording = recordingRef.current;
    if (!currentRecording || currentRecording._isDoneRecording) {
      console.warn("No recording in progress to stop.");
      return;
    }
    console.log("Stopping recording...");

    try {
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      if (uri && audioDetectedRef.current) {
        sendMessage("send-audio", { type: "audio", uri }).then();
      } else {
        console.log("No audio detected. Skipping send.");
      }

      if (endSession) {
        recordingRef.current = null;
        setIsRecording(false);
        setIsSessionActive(false);
        setMetering(-60);
        audioDetectedRef.current = false;
      }
    } catch (error) {
      console.error("Failed to stop recording:", error, recordingRef.current);
    }
  };

  const endSession = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setIsSessionActive(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SoundWave metering={metering} />
      <TouchableOpacity
        onPress={() => setIsSessionActive(true)}
        style={[
          styles.actionButton,
          isSessionActive ? styles.disabledButton : styles.activeButton,
        ]}
        disabled={isSessionActive}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={endSession}
        style={[styles.actionButton, styles.hangupButton]}
        disabled={!isSessionActive}
      >
        <Text style={styles.buttonText}>Hang Up</Text>
      </TouchableOpacity>
      {responseText && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>{responseText}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  actionButton: {
    width: 150,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  activeButton: { backgroundColor: "#007bff" },
  disabledButton: { backgroundColor: "#cccccc" },
  hangupButton: { backgroundColor: "#ff6347" },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  responseContainer: { marginTop: 20 },
  responseText: { fontSize: 16 },
});
