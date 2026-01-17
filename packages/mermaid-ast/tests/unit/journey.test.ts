import { describe, expect, it } from 'bun:test';
import { Journey } from '../../src/journey.js';

describe('Journey Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty journey', () => {
      const journey = Journey.create();
      expect(journey.taskCount).toBe(0);
      expect(journey.sections.length).toBe(0);
    });

    it('should create a journey with title', () => {
      const journey = Journey.create('My User Journey');
      expect(journey.title).toBe('My User Journey');
    });

    it('should parse Mermaid syntax', () => {
      const journey = Journey.parse(`journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me, Cat
    section Go home
      Go downstairs: 5: Me`);

      expect(journey.title).toBe('My working day');
      expect(journey.sections.length).toBe(2);
      expect(journey.taskCount).toBe(3);
    });

    it('should create from existing AST', () => {
      const original = Journey.create('Test')
        .addSection('Section 1')
        .addTask('Section 1', 'Task 1', { score: 4 });

      const copy = Journey.from(original.toAST());
      expect(copy.title).toBe('Test');
      expect(copy.taskCount).toBe(1);
    });
  });

  describe('Section Operations', () => {
    it('should add sections', () => {
      const journey = Journey.create().addSection('Morning').addSection('Afternoon');

      expect(journey.sections.length).toBe(2);
    });

    it('should get section by name', () => {
      const journey = Journey.create()
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3 });

      const section = journey.getSection('Morning');
      expect(section).toBeDefined();
      expect(section!.tasks.length).toBe(1);
    });

    it('should remove sections', () => {
      const journey = Journey.create()
        .addSection('Morning')
        .addSection('Afternoon')
        .removeSection('Morning');

      expect(journey.sections.length).toBe(1);
      expect(journey.getSection('Morning')).toBeUndefined();
    });

    it('should rename sections', () => {
      const journey = Journey.create()
        .addSection('Morning')
        .renameSection('Morning', 'Early Morning');

      expect(journey.getSection('Morning')).toBeUndefined();
      expect(journey.getSection('Early Morning')).toBeDefined();
    });
  });

  describe('Task Operations', () => {
    it('should add tasks to sections', () => {
      const journey = Journey.create()
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3 })
        .addTask('Morning', 'Have breakfast', { score: 5 });

      expect(journey.taskCount).toBe(2);
    });

    it('should create section if it does not exist', () => {
      const journey = Journey.create().addTask('New Section', 'New Task', { score: 4 });

      expect(journey.sections.length).toBe(1);
      expect(journey.getSection('New Section')).toBeDefined();
    });

    it('should add tasks with actors', () => {
      const journey = Journey.create().addTask('Morning', 'Team meeting', {
        score: 4,
        actors: ['Me', 'Team'],
      });

      const task = journey.getTask('Team meeting');
      expect(task).toBeDefined();
      expect(task!.actors).toEqual(['Me', 'Team']);
    });

    it('should remove tasks', () => {
      const journey = Journey.create()
        .addTask('Morning', 'Wake up', { score: 3 })
        .addTask('Morning', 'Have breakfast', { score: 5 })
        .removeTask('Morning', 'Wake up');

      expect(journey.taskCount).toBe(1);
      expect(journey.getTask('Wake up')).toBeUndefined();
    });

    it('should set task score', () => {
      const journey = Journey.create()
        .addTask('Morning', 'Wake up', { score: 3 })
        .setScore('Wake up', 5);

      expect(journey.getTask('Wake up')!.score).toBe(5);
    });

    it('should clamp score to 1-5', () => {
      const journey = Journey.create()
        .addTask('Morning', 'Task', { score: 3 })
        .setScore('Task', 10);

      expect(journey.getTask('Task')!.score).toBe(5);

      journey.setScore('Task', 0);
      expect(journey.getTask('Task')!.score).toBe(1);
    });

    it('should add and remove actors', () => {
      const journey = Journey.create()
        .addTask('Morning', 'Task', { score: 3 })
        .addActor('Task', 'Me')
        .addActor('Task', 'You');

      expect(journey.getTask('Task')!.actors).toEqual(['Me', 'You']);

      journey.removeActor('Task', 'Me');
      expect(journey.getTask('Task')!.actors).toEqual(['You']);
    });

    it('should not add duplicate actors', () => {
      const journey = Journey.create()
        .addTask('Morning', 'Task', { score: 3 })
        .addActor('Task', 'Me')
        .addActor('Task', 'Me');

      expect(journey.getTask('Task')!.actors).toEqual(['Me']);
    });

    it('should move tasks between sections', () => {
      const journey = Journey.create()
        .addSection('Morning')
        .addSection('Afternoon')
        .addTask('Morning', 'Task', { score: 3 })
        .moveTask('Task', 'Afternoon');

      expect(journey.getSection('Morning')!.tasks.length).toBe(0);
      expect(journey.getSection('Afternoon')!.tasks.length).toBe(1);
    });
  });

  describe('Query Operations', () => {
    it('should get all tasks', () => {
      const journey = Journey.create()
        .addTask('Section 1', 'Task 1', { score: 3 })
        .addTask('Section 1', 'Task 2', { score: 5 })
        .addTask('Section 2', 'Task 3', { score: 4 });

      expect(journey.getAllTasks().length).toBe(3);
    });

    it('should find tasks by score', () => {
      const journey = Journey.create()
        .addTask('Section', 'Task 1', { score: 2 })
        .addTask('Section', 'Task 2', { score: 4 })
        .addTask('Section', 'Task 3', { score: 5 });

      const found = journey.findTasks({ score: 4 });
      expect(found.length).toBe(1);
      expect(found[0].name).toBe('Task 2');
    });

    it('should find tasks by min/max score', () => {
      const journey = Journey.create()
        .addTask('Section', 'Task 1', { score: 1 })
        .addTask('Section', 'Task 2', { score: 3 })
        .addTask('Section', 'Task 3', { score: 5 });

      const low = journey.findTasks({ maxScore: 2 });
      expect(low.length).toBe(1);

      const high = journey.findTasks({ minScore: 4 });
      expect(high.length).toBe(1);
    });

    it('should find tasks by actor', () => {
      const journey = Journey.create()
        .addTask('Section', 'Task 1', { score: 3, actors: ['Me'] })
        .addTask('Section', 'Task 2', { score: 4, actors: ['You'] })
        .addTask('Section', 'Task 3', { score: 5, actors: ['Me', 'You'] });

      const found = journey.findTasks({ actor: 'Me' });
      expect(found.length).toBe(2);
    });

    it('should get pain points', () => {
      const journey = Journey.create()
        .addTask('Section', 'Good task', { score: 5 })
        .addTask('Section', 'Bad task', { score: 1 })
        .addTask('Section', 'Okay task', { score: 3 });

      const painPoints = journey.getPainPoints();
      expect(painPoints.length).toBe(1);
      expect(painPoints[0].name).toBe('Bad task');
    });

    it('should get highlights', () => {
      const journey = Journey.create()
        .addTask('Section', 'Great task', { score: 5 })
        .addTask('Section', 'Good task', { score: 4 })
        .addTask('Section', 'Okay task', { score: 3 });

      const highlights = journey.getHighlights();
      expect(highlights.length).toBe(2);
    });

    it('should calculate average score', () => {
      const journey = Journey.create()
        .addTask('Section', 'Task 1', { score: 2 })
        .addTask('Section', 'Task 2', { score: 4 });

      expect(journey.getAverageScore()).toBe(3);
    });

    it('should get all unique actors', () => {
      const journey = Journey.create()
        .addTask('Section', 'Task 1', { score: 3, actors: ['Me', 'You'] })
        .addTask('Section', 'Task 2', { score: 4, actors: ['You', 'Them'] });

      expect(journey.actors).toEqual(['Me', 'You', 'Them']);
    });
  });

  describe('Clone', () => {
    it('should clone the journey', () => {
      const original = Journey.create('Test').addTask('Section', 'Task', { score: 3 });

      const clone = original.clone();
      clone.setTitle('Clone');

      expect(original.title).toBe('Test');
      expect(clone.title).toBe('Clone');
    });
  });
});
