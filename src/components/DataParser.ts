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
}

export function parseBeaconMessage(message: string): BeaconData | null {
    const regex = /Message (\d+).*D\[([^\]]+)\].*L\[([-\d.]+),([-\d.]+),([-\d.]+)\].*R\[([-\d.]+),([-\d.]+),([-\d.]+)\].*RD\[([^\]]+)\]/;
    const match = message.match(regex);

    if (!match) return null;

    const [, messageId, , x, y, z, yaw, pitch, roll, realTimestamp] = match;

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
                console.log("Data loaded successfully. Parsed", parsedData.length, "messages.");
            })
            .catch(error => console.error('Error loading beacon data:', error));
    }, [filePath]);

    return beaconDataArray;
}