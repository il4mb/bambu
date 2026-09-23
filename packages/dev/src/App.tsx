import { Register } from "@bambu/node";
import {
    Theme,
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
import { BinderProvider, EventsManager, VarsManager } from "@bambu/binder";
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
                        height: "50px",
                        background: "red",
                        color: "#ccc",
                    },
                },
            },
            
            // {
            //     type: "list",
            //     id: "111",
            //     data: {
            //         items: [
            //             {
            //                 text: "hallo 1",
            //             },
            //             {
            //                 text: "hallo 2",
            //             },
            //         ],
            //     },
            // },
            // {
            //     type: "text",
            //     parent: "111",
            //     data: {
            //         text: {
            //             type: "binding",
            //             target: "111",
            //             path: ["items", "text"],
            //         },
            //     },
            // },
            // {
            //     type: "element",
            //     data: {
            //         style: {
            //             padding: "40px",
            //             height: "300px",
            //             width: "max(100px, 100vw)",
            //             backgroundImage:
            //                 "linear-gradient(to right, #ff000046, #001faa4b), url(https://cdn.pixabay.com/photo/2025/09/18/17/32/woman-9841606_1280.jpg)",
            //             backgroundColor: "#ff0ff0",
            //             backgroundPosition: "center, center",
            //         },
            //     },
            // },
            // {
            //     id: "1111",
            //     type: "text",
            //     parent: "123",
            //     data: {
            //         text: "Merapi Studio",
            //         style: {
            //             color: "#fff",
            //             fontSize: "24px",
            //             fontWeight: 900,
            //         },
            //     },
            // },
            // {
            //     id: "333",
            //     type: "element",
            //     children: [
            //         {
            //             id: "222",
            //             type: "text",
            //             order: 1,
            //             data: {
            //                 text: "Hallo World",
            //                 style: {
            //                     color: "red",
            //                 },
            //             },
            //         },
            //         {
            //             id: "2232",
            //             type: "text",
            //             order: 0,
            //             props: {
            //                 text: "Hallo World 2",
            //                 style: {
            //                     border: "1px solid red",
            //                     fontSize: 22,
            //                 },
            //             },
            //         },
            //     ],
            // },
            // {
            //     id: "444",
            //     type: "button",
            //     data: {
            //         text: "Click Me",
            //         style: {
            //             padding: "10px",
            //             backgroundColor: "green",
            //             color: "white",
            //         },
            //     },
            //     events: {
            //         click: "alert('Button clicked!')",
            //     },
            // },
        ],
        [],
    );

    const fontsApi = useMemo(
        () => ({
            fetch: async (params: URLSearchParams) => {
                const response = await fetch(`/api/webfonts${params ? `?${params.toString()}` : ""}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch fonts");
                }
                return response.json();
            },
        }),
        [],
    );

    return (
        <Theme>
            <ContainerProvider register={new Register()} initialValue={initialValue}>
                <ViewportProvider>
                    <GestureProvider>
                        <BinderProvider>
                            <StyledProvider fontsApi={fontsApi}>
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
                                        <EventsManager />
                                        <VarsManager />
                                    </div>
                                </div>
                            </StyledProvider>
                        </BinderProvider>
                    </GestureProvider>
                </ViewportProvider>
            </ContainerProvider>
        </Theme>
    );
}
