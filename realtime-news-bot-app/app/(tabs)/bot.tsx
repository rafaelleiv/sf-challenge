import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import useSocketIO from '@/hooks/useWebSocket';
import SoundWave from '@/components/SoundWave';

export default function Bot() {
    const [responseText, setResponseText] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [metering, setMetering] = useState(-60);

    const SILENCE_THRESHOLD = 4000;
    const MIN_METERING = -50;

    const recordingRef = useRef<Audio.Recording | null>(null);
    const audioDetectedRef = useRef(false); // Referencia para estado de audio detectado

    const { isSocketConnected, sendMessage } = useSocketIO(
        'http://10.0.0.95:3002/real-time-news',
        (message: string) => handleWebSocketMessage(message),
        (error: any) => console.error('WebSocket error:', error),
        () => console.log('WebSocket closed')
    );

    const handleWebSocketMessage = (data: string) => {
        try {
            const response = JSON.parse(data);
            console.log('WebSocket message received:', response);
            setResponseText(response.text || 'No response text received.');
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    useEffect(() => {
        if (isSessionActive) {
            startRecording();
        } else {
            stopRecording(true);
        }

        return () => {
            if (recordingRef.current) {
                stopRecording(true);
            }
        };
    }, [isSessionActive]);

    const handleRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
        if (!status.isRecording) return;

        setMetering(status.metering || -60);

        if (status?.metering && status.metering > MIN_METERING) {
            console.log('Audio detected. Resetting silence timeout...');
            audioDetectedRef.current = true;

            if (silenceTimeout) {
                clearTimeout(silenceTimeout);
                setSilenceTimeout(null);
            }
        } else if (audioDetectedRef.current) {
            console.log('Silence detected. Starting timeout...');
            if (!silenceTimeout) {
                const timeout = setTimeout(async () => {
                    await stopRecording(false);
                    await startRecording();
                }, SILENCE_THRESHOLD);
                setSilenceTimeout(timeout);
            }
        }
    };

    const startRecording = async () => {
        if (!isSessionActive || isRecording) return;

        try {
            console.log('Starting recording...');
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                alert('Permission to access microphone is required!');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

            newRecording.setOnRecordingStatusUpdate(handleRecordingStatusUpdate);
            await newRecording.startAsync();

            recordingRef.current = newRecording;
            setIsRecording(true);
            audioDetectedRef.current = false;

            console.log('Recording started successfully');
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopRecording = async (endSession: boolean = false) => {
        const currentRecording = recordingRef.current;
        if (!currentRecording || currentRecording._isDoneRecording) {
            console.warn('No recording in progress to stop.');
            return;
        }

        try {
            console.log('Stopping recording...');
            await currentRecording.stopAndUnloadAsync();
            const uri = currentRecording.getURI();

            if (uri && audioDetectedRef.current) {
                sendMessage('send-audio', JSON.stringify({ type: 'audio', data: uri }));
            } else {
                console.log('No audio detected. Skipping send.');
            }

            if (endSession) {
                recordingRef.current = null;
                setIsRecording(false);
                setIsSessionActive(false);
                setMetering(-60);
                audioDetectedRef.current = false;
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    const endSession = () => {
        setIsSessionActive(false);
        if (silenceTimeout) {
            clearTimeout(silenceTimeout);
            setSilenceTimeout(null);
        }
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
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    actionButton: { width: 150, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginVertical: 10 },
    activeButton: { backgroundColor: '#007bff' },
    disabledButton: { backgroundColor: '#cccccc' },
    hangupButton: { backgroundColor: '#ff6347' },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    responseContainer: { marginTop: 20 },
    responseText: { fontSize: 16 },
});
