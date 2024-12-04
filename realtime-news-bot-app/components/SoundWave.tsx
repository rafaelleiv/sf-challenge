import React, { useState, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SoundWave = ({ metering }: { metering: number }) => {
    const [waveHeight, setWaveHeight] = useState(new Animated.Value(10)); // Altura inicial de las ondas

    useEffect(() => {
        const normalizedMetering = Math.max(10, Math.min(100, Math.abs(metering) * 2)); // Normalizar el valor
        Animated.timing(waveHeight, {
            toValue: normalizedMetering, // Cambiar altura según `metering`
            duration: 300, // Suavizar la animación
            useNativeDriver: false, // Requerido para animaciones de estilo en React Native
        }).start();
    }, [metering]);

    return (
        <View style={styles.waveContainer}>
            {/* Simulación de múltiples ondas */}
            {[...Array(5)].map((_, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.wave,
                        {
                            height: waveHeight.interpolate({
                                inputRange: [10, 100],
                                outputRange: [10, 100 - index * 15], // Reducir progresivamente la altura de las ondas
                                extrapolate: 'clamp',
                            }),
                        },
                    ]}
                />
            ))}
        </View>
    );
};

export default SoundWave;

const styles = StyleSheet.create({
    waveContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 200,
        height: 100,
        marginVertical: 20,
    },
    wave: {
        width: 15,
        backgroundColor: '#007bff',
        borderRadius: 7.5, // Bordes redondeados para simular ondas
    },
});
