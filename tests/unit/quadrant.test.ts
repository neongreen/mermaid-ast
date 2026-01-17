import { describe, expect, it } from 'bun:test';
import { Quadrant } from '../../src/quadrant.js';

describe('Quadrant Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty quadrant chart', () => {
      const quadrant = Quadrant.create();
      expect(quadrant.pointCount).toBe(0);
    });

    it('should create with title', () => {
      const quadrant = Quadrant.create('My Chart');
      expect(quadrant.title).toBe('My Chart');
    });

    it('should parse Mermaid syntax', () => {
      const quadrant = Quadrant.parse(`quadrantChart
    A: [0.5, 0.5]
    B: [0.7, 0.8]`);

      expect(quadrant.pointCount).toBe(2);
    });
  });

  describe('Point Operations', () => {
    it('should add points', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.3, 0.7).addPoint('B', 0.8, 0.2);

      expect(quadrant.pointCount).toBe(2);
      expect(quadrant.getPoint('A')).toEqual({ name: 'A', x: 0.3, y: 0.7 });
    });

    it('should remove points', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5).addPoint('B', 0.7, 0.8).removePoint('A');

      expect(quadrant.pointCount).toBe(1);
      expect(quadrant.getPoint('A')).toBeUndefined();
    });

    it('should update point coordinates', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5).updatePoint('A', 0.7, 0.8);

      const point = quadrant.getPoint('A');
      expect(point?.x).toBe(0.7);
      expect(point?.y).toBe(0.8);
    });
  });

  describe('Query Operations', () => {
    it('should find points by coordinates', () => {
      const quadrant = Quadrant.create()
        .addPoint('A', 0.2, 0.3)
        .addPoint('B', 0.7, 0.8)
        .addPoint('C', 0.5, 0.9);

      const highX = quadrant.findPoints({ minX: 0.5 });
      expect(highX.length).toBe(2);
    });

    it('should get points by quadrant', () => {
      const quadrant = Quadrant.create()
        .addPoint('Q1', 0.6, 0.7) // Quadrant 1
        .addPoint('Q2', 0.3, 0.8) // Quadrant 2
        .addPoint('Q3', 0.2, 0.3) // Quadrant 3
        .addPoint('Q4', 0.8, 0.2); // Quadrant 4

      expect(quadrant.getPointsInQuadrant(1).length).toBe(1);
      expect(quadrant.getPointsInQuadrant(2).length).toBe(1);
      expect(quadrant.getPointsInQuadrant(3).length).toBe(1);
      expect(quadrant.getPointsInQuadrant(4).length).toBe(1);
    });
  });
});
