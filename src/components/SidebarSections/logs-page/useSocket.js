// useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (url, user) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            const newSocket = io(url);
            setSocket(newSocket);

            return () => newSocket.disconnect();
        }
    }, [url, user]);

    return socket;
};
