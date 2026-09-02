import { Register } from "@bambu/node";
import {
    Canvas,
    Screen,
    ContainerProvider,
    GestureProvider,
    SpotsContainer,
    ViewportProvider,
    DeviceSwitch,
    HilightSpot,
} from "@bambu/react";
import { StyledManager, StyledProvider } from "@bambu/styled";
import { useMemo } from "react";

type AppProps = {};

export default function App({}: AppProps) {
    const initialValue = useMemo<PlainNode[]>(
        () => [
            {
                id: "123",
                type: "element",
                data: {
                    style: {
                        padding: "50px",
                        background: "red",
                        color: "#ccc",
                    },
                },
            },
            {
                type: "element",
                data: {
                    style: {
                        padding: "40px",
                        height: '300px',
                        width: 'max(100px, 100vw)',
                        backgroundImage:
                            "linear-gradient(to right, #ff000046, #001faa4b), url(https://cdn.pixabay.com/photo/2025/09/18/17/32/woman-9841606_1280.jpg)",
                        backgroundColor: "#ff0ff0",
                        backgroundPosition: "center, center",
                    },
                },
            },
            {
                id: "1111",
                type: "text",
                parent: "123",
                data: {
                    text: "Hallo World",
                    style: {
                        color: "blue",
                    },
                },
            },
            {
                id: "333",
                type: "element",
                children: [
                    {
                        id: "222",
                        type: "text",
                        order: 1,
                        data: {
                            text: "Hallo World",
                            style: {
                                color: "red",
                            },
                        },
                    },
                    {
                        id: "2232",
                        type: "text",
                        order: 0,
                        props: {
                            text: "Hallo World 2",
                            style: {
                                border: "1px solid red",
                                fontSize: 22,
                            },
                        },
                    },
                ],
            },
        ],
        [],
    );

    return (
        <ContainerProvider register={new Register()} initialValue={initialValue}>
            <ViewportProvider>
                <GestureProvider>
                    <StyledProvider>
                        <div>
                            <DeviceSwitch />
                        </div>
                        <div style={{ display: "flex", flex: 1 }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <Screen>
                                    <Canvas />
                                    <SpotsContainer>
                                        <HilightSpot />
                                    </SpotsContainer>
                                </Screen>
                            </div>
                            <div style={{ flexBasis: 260 }}>
                                <StyledManager />
                            </div>
                        </div>
                    </StyledProvider>
                </GestureProvider>
            </ViewportProvider>
        </ContainerProvider>
    );
}
