/**
 * Journey Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseJourney } from '../../src/parser/journey-parser.js';
import { renderJourney } from '../../src/renderer/journey-renderer.js';
import { Journey } from '../../src/journey.js';
import { expectGolden } from '../golden/golden.js';

describe('Journey Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal journey diagram', () => {
      const ast = parseJourney(`journey
    title My Journey`);
      const rendered = renderJourney(ast);
      expect(rendered).toContain('journey');
      expect(rendered).toContain('title My Journey');
    });

    it('should render journey with title', () => {
      const journey = Journey.create('User Onboarding');
      const rendered = journey.render();
      expect(rendered).toContain('journey');
      expect(rendered).toContain('title User Onboarding');
    });

    it('should render journey without title', () => {
      const journey = Journey.create();
      const rendered = journey.render();
      expect(rendered).toContain('journey');
      expect(rendered).not.toContain('title');
    });
  });

  describe('Section Rendering', () => {
    it('should render single section', () => {
      const journey = Journey.create('My Journey').addSection('Getting Started');
      const rendered = journey.render();
      expect(rendered).toContain('section Getting Started');
    });

    it('should render multiple sections', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addSection('Afternoon')
        .addSection('Evening');
      const rendered = journey.render();
      expect(rendered).toContain('section Morning');
      expect(rendered).toContain('section Afternoon');
      expect(rendered).toContain('section Evening');
    });

    it('should render sections in order', () => {
      const journey = Journey.create('My Journey')
        .addSection('First')
        .addSection('Second')
        .addSection('Third');
      const rendered = journey.render();
      const firstIdx = rendered.indexOf('section First');
      const secondIdx = rendered.indexOf('section Second');
      const thirdIdx = rendered.indexOf('section Third');
      expect(firstIdx).toBeLessThan(secondIdx);
      expect(secondIdx).toBeLessThan(thirdIdx);
    });
  });

  describe('Task Rendering', () => {
    it('should render task with score', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3 });
      const rendered = journey.render();
      expect(rendered).toContain('Wake up: 3');
    });

    it('should render task with default score', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addTask('Morning', 'Wake up');
      const rendered = journey.render();
      expect(rendered).toContain('Wake up: 5');
    });

    it('should render task with actors', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3, actors: ['Me'] });
      const rendered = journey.render();
      expect(rendered).toContain('Wake up: 3: Me');
    });

    it('should render task with multiple actors', () => {
      const journey = Journey.create('My Journey')
        .addSection('Meeting')
        .addTask('Meeting', 'Discuss project', { score: 4, actors: ['Alice', 'Bob', 'Charlie'] });
      const rendered = journey.render();
      expect(rendered).toContain('Discuss project: 4: Alice, Bob, Charlie');
    });

    it('should render multiple tasks in section', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3 })
        .addTask('Morning', 'Breakfast', { score: 5 })
        .addTask('Morning', 'Commute', { score: 1 });
      const rendered = journey.render();
      expect(rendered).toContain('Wake up: 3');
      expect(rendered).toContain('Breakfast: 5');
      expect(rendered).toContain('Commute: 1');
    });

    it('should render tasks with all score values (1-5)', () => {
      const journey = Journey.create('Score Test')
        .addSection('Scores')
        .addTask('Scores', 'Score 1', { score: 1 })
        .addTask('Scores', 'Score 2', { score: 2 })
        .addTask('Scores', 'Score 3', { score: 3 })
        .addTask('Scores', 'Score 4', { score: 4 })
        .addTask('Scores', 'Score 5', { score: 5 });
      const rendered = journey.render();
      expect(rendered).toContain('Score 1: 1');
      expect(rendered).toContain('Score 2: 2');
      expect(rendered).toContain('Score 3: 3');
      expect(rendered).toContain('Score 4: 4');
      expect(rendered).toContain('Score 5: 5');
    });
  });

  describe('Complex Diagrams', () => {
    it('should render complete journey with multiple sections and tasks', () => {
      const journey = Journey.create('User Onboarding')
        .addSection('Discovery')
        .addTask('Discovery', 'Find website', { score: 3, actors: ['User'] })
        .addTask('Discovery', 'Read landing page', { score: 4, actors: ['User'] })
        .addSection('Sign Up')
        .addTask('Sign Up', 'Click sign up', { score: 5, actors: ['User'] })
        .addTask('Sign Up', 'Fill form', { score: 2, actors: ['User'] })
        .addTask('Sign Up', 'Verify email', { score: 1, actors: ['User', 'System'] })
        .addSection('First Use')
        .addTask('First Use', 'Complete tutorial', { score: 4, actors: ['User'] })
        .addTask('First Use', 'Create first project', { score: 5, actors: ['User'] });

      const rendered = journey.render();
      expect(rendered).toContain('title User Onboarding');
      expect(rendered).toContain('section Discovery');
      expect(rendered).toContain('section Sign Up');
      expect(rendered).toContain('section First Use');
      expect(rendered).toContain('Find website: 3: User');
      expect(rendered).toContain('Verify email: 1: User, System');
    });
  });

  describe('Golden Tests', () => {
    it('should render basic journey', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3, actors: ['Me'] });

      expectGolden(journey.render(), 'journey/render-basic.mmd');
    });

    it('should render complex journey', () => {
      const journey = Journey.create('Customer Support Experience')
        .addSection('Initial Contact')
        .addTask('Initial Contact', 'Search for help', { score: 3, actors: ['Customer'] })
        .addTask('Initial Contact', 'Find contact page', { score: 4, actors: ['Customer'] })
        .addTask('Initial Contact', 'Submit ticket', { score: 2, actors: ['Customer'] })
        .addSection('Response')
        .addTask('Response', 'Receive auto-reply', { score: 3, actors: ['Customer', 'System'] })
        .addTask('Response', 'Wait for agent', { score: 1, actors: ['Customer'] })
        .addTask('Response', 'Get human response', { score: 5, actors: ['Customer', 'Agent'] })
        .addSection('Resolution')
        .addTask('Resolution', 'Follow instructions', { score: 4, actors: ['Customer'] })
        .addTask('Resolution', 'Problem solved', { score: 5, actors: ['Customer'] });

      expectGolden(journey.render(), 'journey/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const ast = parseJourney(`journey
    title Test`);
      const rendered = renderJourney(ast, { indent: 2 });
      const lines = rendered.split('\n');
      expect(lines[1]).toMatch(/^\s{2}title/);
    });

    it('should support tab indent', () => {
      const ast = parseJourney(`journey
    title Test`);
      const rendered = renderJourney(ast, { indent: 'tab' });
      expect(rendered).toContain('\ttitle');
    });
  });

  describe('Round-trip Rendering', () => {
    it('should preserve content through parse-render cycle', () => {
      const original = `journey
    title My Journey
    section Morning
        Wake up: 3: Me
        Breakfast: 5: Me, Family`;

      const ast = parseJourney(original);
      const rendered = renderJourney(ast);

      expect(rendered).toContain('title My Journey');
      expect(rendered).toContain('section Morning');
      expect(rendered).toContain('Wake up: 3: Me');
      expect(rendered).toContain('Breakfast: 5: Me, Family');
    });
  });
});
