import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

// position 정보를 props로 받음
interface GlobeComponentProps {
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ position }) => {
  const globeRef = useRef<HTMLDivElement | null>(null); // DOM 참조

  useEffect(() => {
    if (globeRef.current) {
      // 비콘 위치 데이터를 기반으로 설정
      const beaconData = [
        {
          lat: position.latitude,
          lng: position.longitude,
          alt: position.altitude / 6371, // 지구 반지름에 따른 상대 고도
          color: ['yellow', 'blue'],
        },
      ];

      // Globe 설정
      const world = Globe()(globeRef.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .pointsData(beaconData) // 비콘 위치를 포인트로 추가
        .pointAltitude('alt')
        .pointColor(() => 'yellow') // 포인트 색상
        .pointRadius(0.2); // 포인트 크기

      return () => {
        world.controls().dispose(); // Clean up the controls when unmounting
      };
    }
  }, [position]); // position이 변경될 때마다 실행

  return <div ref={globeRef} style={{ width: '100%', height: '100vh' }} />;
};

export default GlobeComponent;
