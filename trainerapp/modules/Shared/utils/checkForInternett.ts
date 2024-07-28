import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const ckeckInternet = (): boolean => {
    const [Online, isOnline] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            isOnline(state.isConnected ?? false);
        });

        return () => unsubscribe();
    }, []);

    return Online;
};
