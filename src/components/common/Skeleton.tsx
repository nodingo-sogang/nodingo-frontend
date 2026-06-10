import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

/** 로딩 중 목업 깜빡임 대신 흐르는 회색 블록을 표시하는 스켈레톤 프리미티브 */
export default function Skeleton({ width = '100%', height = 14, radius = 10, style }: SkeletonProps) {
  return (
    <div
      className="nodingo-skel"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}
