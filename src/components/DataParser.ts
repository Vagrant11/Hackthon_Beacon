import { useState, useEffect } from 'react';

export interface BeaconData {
    messageId: number;
    timestamp: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        yaw: number;
        pitch: number;
        roll: number;
    };
    acceleration: {
        x: number;
        y: number;
        z: number;
    };
}

export function parseBeaconMessage(message: string): BeaconData | null {
    // 更新正则表达式，增加对加速度的捕获
    const regex = /Message (\d+).*D\[([^\]]+)\].*L\[([-\d.]+),([-\d.]+),([-\d.]+)\].*R\[([-\d.]+),([-\d.]+),([-\d.]+)\].*A\[([-\d.]+),([-\d.]+),([-\d.]+)\].*RD\[([^\]]+)\]/;
    const match = message.match(regex);

    if (!match) return null;

    const [, messageId, , x, y, z, yaw, pitch, roll, ax, ay, az, realTimestamp] = match;

    return {
        messageId: parseInt(messageId),
        timestamp: realTimestamp,
        position: {
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z)
        },
        rotation: {
            yaw: parseFloat(yaw),
            pitch: parseFloat(pitch),
            roll: parseFloat(roll)
        },
        acceleration: {
            x: parseFloat(ax),
            y: parseFloat(ay),
            z: parseFloat(az)
        }
    };
}

export function useBeaconData(filePath: string) {
    const [beaconDataArray, setBeaconDataArray] = useState<BeaconData[]>([]);

    useEffect(() => {
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                const messages = text.split('Message').filter(msg => msg.trim());
                const parsedData = messages.map(msg => parseBeaconMessage('Message' + msg)).filter((data): data is BeaconData => data !== null);
                setBeaconDataArray(parsedData);
                // 打印出每个数据的位置信息，检查是否解析正确
                parsedData.forEach((data, index) => {
                    console.log(`Message ${index}: Position = (${data.position.x}, ${data.position.y}, ${data.position.z}), Acceleration = (${data.acceleration.x}, ${data.acceleration.y}, ${data.acceleration.z})`);
                });
            })
            .catch(error => console.error('Error loading beacon data:', error));
    }, [filePath]);

    return beaconDataArray;
}
