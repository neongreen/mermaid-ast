/**
 * Class diagram example
 * This example mirrors the README "Class Diagrams" section
 */
import { parseClassDiagram, renderClassDiagram } from '../src/index.js';

const ast = parseClassDiagram(`classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    Animal <|-- Duck`);

// Access AST properties
console.log('Classes count:', ast.classes.size); // 2
console.log('Relations count:', ast.relations.length); // 1

// Render back
const output = renderClassDiagram(ast);
console.log('\nRendered output:');
console.log(output);
