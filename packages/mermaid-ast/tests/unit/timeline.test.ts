import { describe, expect, it } from 'bun:test';
import { Timeline } from '../../src/timeline.js';

describe('Timeline Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty timeline', () => {
      const timeline = Timeline.create();
      expect(timeline.periodCount).toBe(0);
      expect(timeline.eventCount).toBe(0);
    });

    it('should create a timeline with title', () => {
      const timeline = Timeline.create('My Timeline');
      expect(timeline.title).toBe('My Timeline');
    });

    it('should parse Mermaid syntax', () => {
      const timeline = Timeline.parse(`timeline
    title History of Social Media
    section 2000s
      2002 : LinkedIn
      2004 : Facebook
    section 2010s
      2010 : Instagram`);

      expect(timeline.title).toBe('History of Social Media');
      expect(timeline.sections.length).toBe(2);
    });

    it('should create from existing AST', () => {
      const original = Timeline.create('Test')
        .addSection('Section 1')
        .addPeriod('Section 1', '2020');

      const copy = Timeline.from(original.toAST());
      expect(copy.title).toBe('Test');
      expect(copy.periodCount).toBe(1);
    });
  });

  describe('Section Operations', () => {
    it('should add sections', () => {
      const timeline = Timeline.create().addSection('2000s').addSection('2010s');

      expect(timeline.sections.length).toBe(2);
    });

    it('should get section by name', () => {
      const timeline = Timeline.create().addSection('2000s').addPeriod('2000s', '2005');

      const section = timeline.getSection('2000s');
      expect(section).toBeDefined();
      expect(section!.periods.length).toBe(1);
    });

    it('should remove sections', () => {
      const timeline = Timeline.create()
        .addSection('2000s')
        .addSection('2010s')
        .removeSection('2000s');

      expect(timeline.sections.length).toBe(1);
      expect(timeline.getSection('2000s')).toBeUndefined();
    });

    it('should rename sections', () => {
      const timeline = Timeline.create().addSection('2000s').renameSection('2000s', 'Early 2000s');

      expect(timeline.getSection('2000s')).toBeUndefined();
      expect(timeline.getSection('Early 2000s')).toBeDefined();
    });
  });

  describe('Period Operations', () => {
    it('should add periods to sections', () => {
      const timeline = Timeline.create()
        .addSection('2000s')
        .addPeriod('2000s', '2005')
        .addPeriod('2000s', '2008');

      expect(timeline.periodCount).toBe(2);
    });

    it('should create section if it does not exist', () => {
      const timeline = Timeline.create().addPeriod('New Section', '2020');

      expect(timeline.sections.length).toBe(1);
      expect(timeline.getSection('New Section')).toBeDefined();
    });

    it('should get period by name', () => {
      const timeline = Timeline.create().addPeriod('Section', '2020').addEvent('2020', 'Event 1');

      const period = timeline.getPeriod('2020');
      expect(period).toBeDefined();
      expect(period!.events.length).toBe(1);
    });

    it('should remove periods', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addPeriod('Section', '2021')
        .removePeriod('2020');

      expect(timeline.periodCount).toBe(1);
      expect(timeline.getPeriod('2020')).toBeUndefined();
    });

    it('should rename periods', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .renamePeriod('2020', 'Year 2020');

      expect(timeline.getPeriod('2020')).toBeUndefined();
      expect(timeline.getPeriod('Year 2020')).toBeDefined();
    });
  });

  describe('Event Operations', () => {
    it('should add events to periods', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Event 1')
        .addEvent('2020', 'Event 2');

      expect(timeline.eventCount).toBe(2);
    });

    it('should add event with period creation', () => {
      const timeline = Timeline.create().addEventWithPeriod('Section', '2020', 'Event 1');

      expect(timeline.periodCount).toBe(1);
      expect(timeline.eventCount).toBe(1);
    });

    it('should remove events', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Event 1')
        .addEvent('2020', 'Event 2')
        .removeEvent('2020', 'Event 1');

      expect(timeline.eventCount).toBe(1);
    });

    it('should update event text', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Old Text')
        .updateEvent('2020', 'Old Text', 'New Text');

      const events = timeline.getEventsForPeriod('2020');
      expect(events[0].text).toBe('New Text');
    });
  });

  describe('Query Operations', () => {
    it('should get all periods', () => {
      const timeline = Timeline.create()
        .addPeriod('Section 1', '2020')
        .addPeriod('Section 1', '2021')
        .addPeriod('Section 2', '2022');

      expect(timeline.getAllPeriods().length).toBe(3);
    });

    it('should get all events', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Event 1')
        .addEvent('2020', 'Event 2')
        .addPeriod('Section', '2021')
        .addEvent('2021', 'Event 3');

      expect(timeline.getAllEvents().length).toBe(3);
    });

    it('should find periods by name', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', 'Q1 2020')
        .addPeriod('Section', 'Q2 2020')
        .addPeriod('Section', 'Q1 2021');

      const found = timeline.findPeriods({ nameContains: '2020' });
      expect(found.length).toBe(2);
    });

    it('should find periods with events', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Event')
        .addPeriod('Section', '2021');

      const withEvents = timeline.findPeriods({ hasEvents: true });
      expect(withEvents.length).toBe(1);

      const withoutEvents = timeline.findPeriods({ hasEvents: false });
      expect(withoutEvents.length).toBe(1);
    });

    it('should find events by text', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Launch product')
        .addEvent('2020', 'Marketing campaign')
        .addEvent('2020', 'Product update');

      const found = timeline.findEvents({ textContains: 'product' });
      expect(found.length).toBe(1); // Case sensitive
    });

    it('should get events for period', () => {
      const timeline = Timeline.create()
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Event 1')
        .addEvent('2020', 'Event 2');

      const events = timeline.getEventsForPeriod('2020');
      expect(events.length).toBe(2);
    });

    it('should get section for period', () => {
      const timeline = Timeline.create().addSection('History').addPeriod('History', '2020');

      const section = timeline.getSectionForPeriod('2020');
      expect(section).toBeDefined();
      expect(section!.name).toBe('History');
    });
  });

  describe('Clone', () => {
    it('should clone the timeline', () => {
      const original = Timeline.create('Test')
        .addPeriod('Section', '2020')
        .addEvent('2020', 'Event');

      const clone = original.clone();
      clone.setTitle('Clone');

      expect(original.title).toBe('Test');
      expect(clone.title).toBe('Clone');
    });
  });
});
