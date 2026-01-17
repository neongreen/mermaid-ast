import { describe, it } from 'bun:test';
import { ClassDiagram } from '../../src/class-diagram.js';
import { expectGolden } from '../golden/golden.js';

describe('ClassDiagram Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const diagram = ClassDiagram.create()
        .addClass('Animal')
        .addMethod('Animal', 'eat()', '+')
        .addClass('Dog')
        .addInheritance('Dog', 'Animal');
      
      expectGolden(diagram.render(), 'class/render-basic.mmd');
    });
  });
});