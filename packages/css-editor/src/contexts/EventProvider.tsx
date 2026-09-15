import { CssNode } from "css-tree";
import {
    createContext,
    forwardRef,
    ReactNode,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";

type Listener = () => void;

type EventsContext = {
    addListener: (node: CssNode, callback: Listener) => () => void;
};

export type EventsEmitter = {
    emit: (node: CssNode) => void;
    removeAllListeners: (node?: CssNode) => void;
};

const Context = createContext<EventsContext | undefined>(undefined);

export const useEvents = () => {
    const ctx = useContext(Context);

    if (!ctx) {
        throw new Error("useEvents must be called within EventProvider");
    }

    return ctx;
};

type EventsProviderProps = {
    children?: ReactNode;
};

const EventsProvider = forwardRef<EventsEmitter, EventsProviderProps>(({ children }, ref) => {
    const collections = useRef<Map<CssNode, Set<Listener>>>(new Map());

    const emit = useCallback((node: CssNode) => {
        const listeners = collections.current.get(node);

        if (!listeners) {
            return;
        }

        // Copy first so listeners can safely unsubscribe
        // themselves while the event is being emitted.
        for (const callback of [...listeners]) {
            try {
                callback();
            } catch {
                // Prevent one listener from breaking the others.
            }
        }
    }, []);

    const addListener = useCallback((node: CssNode, callback: Listener) => {
        let listeners = collections.current.get(node);

        if (!listeners) {
            listeners = new Set();
            collections.current.set(node, listeners);
        }

        listeners.add(callback);

        return () => {
            listeners!.delete(callback);

            // Cleanup empty collections
            if (listeners!.size === 0) {
                collections.current.delete(node);
            }
        };
    }, []);

    const removeAllListeners = useCallback((node?: CssNode) => {
        if (node) {
            collections.current.delete(node);
        } else {
            collections.current.clear();
        }
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            emit,
            removeAllListeners,
        }),
        [emit, removeAllListeners],
    );

    const values = useMemo<EventsContext>(
        () => ({
            addListener,
        }),
        [addListener],
    );

    return <Context.Provider value={values}>{children}</Context.Provider>;
});

EventsProvider.displayName = "EventsProvider";

export default EventsProvider;
