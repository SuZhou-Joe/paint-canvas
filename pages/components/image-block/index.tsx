import React, { useCallback } from 'react';
import { Point } from '../../../interface';
import styles from './index.module.css';

export interface IImageBlockProps {
    onClick?: (point: Point) => void;
    point: Point;
}

export default function ImageBlock(props: IImageBlockProps) {
    const onClick = useCallback(() => {
        props.onClick && props.onClick(props.point);
    }, [props.onClick, props.point]);
    return (
        <div className={styles.blockContainer} onClick={onClick}>
            {props.point.x}-{props.point.y}
        </div>
    );
}