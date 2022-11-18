import React, { useCallback } from 'react';
import { Point } from '../../interface';
import styles from './index.module.css';

export interface IImageBlockProps {
    onClick?: (point: Point) => void;
    point: Point;
}

export default function ImageBlock(props: IImageBlockProps) {
    const { onClick, point } = props;
    const onClickHandler = useCallback(() => {
        onClick && onClick(props.point);
    }, [onClick, point]);
    return (
        <div className={styles.blockContainer} onClick={onClickHandler}>
            {props.point.x}-{props.point.y}
        </div>
    );
}