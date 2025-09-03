"use client";
import { twMerge } from "tailwind-merge";
import * as d3 from "d3";
import { createNoise3D } from "simplex-noise";
import { useEffect, useRef } from "react";

interface LineData {
  x: number;
  y: number;
  dt: number;
  index: number;
}

const Lines = ({ className }: { className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let frame: number;
    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 0;
    const height = svg.node()?.getBoundingClientRect().height || 0;
    const noise3D = createNoise3D();

    const DURATION = 80000;

    let dt = Math.random();
    const startTime = performance.now();

    const paths: LineData[][] = [];
    for (let i = 0; i < 20; i++) {
      const path = [];
      for (let j = 0; j <= 6; j++) {
        path.push({ x: j / 4, y: j, dt: dt, index: i });
      }
      paths.push(path);
    }

    const lineGap = 20;

    const pathOffset = (i: number) => {
      return i * lineGap;
    };

    const plotY = (d: LineData) => {
      const tOffset = Math.sin(6 * dt + d.x);

      // Pin the ends of the path
      if (d.x === 0 || d.x === 1) {
        return height / 2 + pathOffset(d.index);
      }

      return (
        0.5 * height * (noise3D(d.x, d.y, tOffset) + 1) + pathOffset(d.index)
      );
    };

    const lineFunction = d3
      .line<LineData>()
      .x((d) => d.x * width)
      .y((d) => plotY(d))
      .curve(d3.curveBundle);

    const lines = svg.selectAll("path").data(paths);

    lines
      .enter()
      .append("path")
      .attr("d", lineFunction)
      .attr("stroke", "rgb(204 223 82 / 100%)")
      .attr("stroke-width", 1)
      .attr("fill", "none");

    const animate = () => {
      dt = ((performance.now() - startTime) % DURATION) / DURATION;
      lines.attr("d", lineFunction);
      frame = window.requestAnimationFrame(animate);
    };

    window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <svg
      id="gp-lines"
      ref={svgRef}
      className={twMerge("text-green-brand", className)}
    />
  );
};

export default Lines;
