import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Svg, Image as SvgImage, Filter, FeColorMatrix } from 'react-native-svg';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert';

const FILTERS: Record<FilterType, number[] | null> = {
  none: null,
  grayscale: [0.3333,0.3333,0.3333,0,0, 0.3333,0.3333,0.3333,0,0, 0.3333,0.3333,0.3333,0,0, 0,0,0,1,0],
  sepia: [0.393,0.769,0.189,0,0, 0.349,0.686,0.168,0,0, 0.272,0.534,0.131,0,0, 0,0,0,1,0],
  invert: [-1,0,0,0,1, 0,-1,0,0,1, 0,0,-1,0,1, 0,0,0,1,0],
};

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera>(null); // Correction ici
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>Accès caméra refusé !</Text>;

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.front} 
        >
          <View style={styles.buttonContainer}>
            <Button title="📸 Prendre un selfie" onPress={takePicture} color="#fff" />
          </View>
        </Camera>
      ) : (
        <View style={styles.previewContainer}>
          <Svg style={styles.image} width="100%" height="80%">
            <Filter id="filter">
              {FILTERS[selectedFilter] && (
                <FeColorMatrix 
                  type="matrix" 
                  values={FILTERS[selectedFilter]?.join(' ')} 
                />
              )}
            </Filter>
            <SvgImage
              href={{ uri: capturedImage }}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              filter={selectedFilter !== 'none' ? "url(#filter)" : undefined}
            />
          </Svg>

          <View style={styles.filterButtons}>
            {(Object.keys(FILTERS) as FilterType[]).map(filter => (
              <Button
                key={filter}
                title={filter.charAt(0).toUpperCase() + filter.slice(1)}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
            <Button title="Reprendre" onPress={() => setCapturedImage(null)} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  buttonContainer: { 
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    margin: 20,
  },
  previewContainer: { flex: 1 },
  image: { flex: 1 },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});