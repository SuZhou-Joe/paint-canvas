import classNames from "classnames";
import React, { useCallback, useRef } from "react";
import { Point } from "../../interface";
import styles from "./index.module.css";

export interface IImageBlockProps {
  onClick?: (point: Point) => void;
  point: Point;
  isFocused?: boolean;
  blockData: {
    image?: string
  }
}

export default function ImageBlock(props: IImageBlockProps) {
  const { onClick, point, isFocused } = props;
  const onClickHandler = useCallback(() => {
    onClick && onClick(point);
  }, [onClick, point]);
  const clickRef = useRef(Date.now());
  return (
    <div
      className={classNames({
        [styles.blockContainer]: true,
        [styles.blockContainer_focused]: isFocused
      })}
      style={{
        backgroundImage: `url(${props.blockData.image})`
      }}
      onClick={e => e.stopPropagation()}
      onMouseDown={() => clickRef.current = Date.now()}
      onMouseUp={() => {
        if (Date.now() - clickRef.current < 200) {
          setTimeout(() => {
            onClickHandler();
          }, 0);
        }
      }}
    >
    </div>
  );
}
