import React, { useCallback, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { set } from 'lodash';
import ImageBlock, { IImageBlockProps } from '../image-block';
import { Point } from '../../interface';
import Actions from '../actions';
import styles from './index.module.css';

export default function App() {
    const wrapperRef = useRef<ReactZoomPanPinchRef>(null);
    const [focusedPoint, setFocusedPoint] = useState({} as Point);
    const [generateModalVisible, setGenerateModalVisible] = useState(false);
    const payload: {}[][] = [];
    for (let i = 0; i < 100; i++) {
        payload.push([]);
        for (let j = 0; j < 100; j++) {
            payload[i].push({});
        }
    }
    const [payloadState, setPayloadState] = useState(payload);
    const onZoomIn: IImageBlockProps["onClick"] = useCallback((point: Point) => {
        const blockWidth = 512;
        const { x, y } = point;
        const innerWidth = window.innerWidth;
        const innerHeight = window.innerHeight;
        const calculatedPoint: Point = {
            x: - (x + 1/2) * blockWidth + innerWidth / 2,
            y: - (y + 1/2) * blockWidth + innerHeight / 2,
        };
        setFocusedPoint(point);
        setGenerateModalVisible(true);
        wrapperRef.current?.setTransform(calculatedPoint.x, calculatedPoint.y, 1);
    }, []);
    const onImageGenerated = (image: string) => {
        set(payloadState, `${focusedPoint.y}.${focusedPoint.x}.image`, image);
        setPayloadState([ ...payloadState ]);
    }
    return (
        <>
            <TransformWrapper
                centerZoomedOut
                minScale={0.05}
                ref={wrapperRef}
                doubleClick={{
                    disabled: true
                }}
            >
                <TransformComponent>
                    <div
                        className={styles.bodyContainer}
                    >
                        {
                            payloadState.map((rowBlocks, rowIndex) => {
                                return (
                                    <div key={rowIndex} className={styles.blockRow}>
                                        {
                                            rowBlocks.map((block, blockIndex) => {
                                                const isFocused = focusedPoint.x === blockIndex && focusedPoint.y === rowIndex;
                                                return (
                                                    <ImageBlock blockData={block} isFocused={isFocused} point={{ y: rowIndex, x: blockIndex }} onClick={onZoomIn} key={`${rowIndex}-${blockIndex}`} />
                                                );
                                            })
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                </TransformComponent>
                <Actions
                    visible={generateModalVisible}
                    onImageGenerated={onImageGenerated}
                />
            </TransformWrapper>
        </>
    );
}