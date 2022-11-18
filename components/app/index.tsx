import React, { useCallback, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import styles from './index.module.css';
import ImageBlock, { IImageBlockProps } from '../image-block';
import { Point } from '../../interface';

export default function App() {
    const wrapperRef = useRef<ReactZoomPanPinchRef>(null);
    const payload: number[][] = [];
    for (let i = 0; i < 100; i++) {
        payload.push([]);
        for (let j = 0; j < 100; j++) {
            payload[i].push(j);
        }
    }
    const onZoomIn: IImageBlockProps["onClick"] = useCallback((point: Point) => {
        const blockWidth = 512;
        const { x, y } = point;
        const innerWidth = window.innerWidth;
        const innerHeight = window.innerHeight;
        const calculatedPoint: Point = {
            x: - (x + 1/2) * blockWidth + innerWidth / 2,
            y: - (y + 1/2) * blockWidth + innerHeight / 2,
        };
        wrapperRef.current?.setTransform(calculatedPoint.x, calculatedPoint.y, 1);
    }, []);
    return (
        <TransformWrapper
            centerZoomedOut
            minScale={0.005}
            ref={wrapperRef}
        >
            <TransformComponent>
                <div
                    className={styles.bodyContainer}
                >
                    {
                        payload.map((rowBlocks, rowIndex) => {
                            return (
                                <div key={rowIndex} className={styles.blockRow}>
                                    {
                                        rowBlocks.map((block, blockIndex) => <ImageBlock point={{ y: rowIndex, x: blockIndex }} onClick={onZoomIn} key={`${rowIndex}-${blockIndex}`} />)
                                    }
                                </div>
                            );
                        })
                    }
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
}