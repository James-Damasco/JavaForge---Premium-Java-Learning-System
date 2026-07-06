const MOCK_BOOKS_DATABASE = {
    intro: {
        id: 'intro',
        title: 'Introduction to Java Syntax',
        difficulty: 'beginner',
        author: 'Dr. Evelyn Carter',
        chapters: [
            {
                title: 'Basic Structure & Variables',
                content: `
                            <h2 class="text-2xl font-bold mb-4">Hello World & Base Syntactical Rules</h2>
                            <p class="mb-4 text-slate-600 dark:text-slate-300">Every Java code run executes within defined scope containers called <strong>Classes</strong>. Let's inspect standard procedural structures:</p>
                            
                            <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6 font-mono text-sm text-brand-400">
                                <span class="text-slate-400">// Hello World Structure</span><br>
                                <span class="text-indigo-400">public class</span> <span class="text-emerald-400">Main</span> {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">public static void</span> <span class="text-brand-300">main</span>(String[] args) {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="text-amber-300">"Hello, JavaForge!"</span>);<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;}<br>
                                }
                            </div>

                            <h3 class="text-lg font-bold mb-3">Java Data Types Summary</h3>
                            <p class="mb-4">Java is a strictly-typed language. You must declare every variable type explicitly:</p>
                            <ul class="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>int</strong>: Used for integers (e.g., <code>int count = 5;</code>)</li>
                                <li><strong>double</strong>: Used for floating-point decimals (e.g., <code>double score = 94.5;</code>)</li>
                                <li><strong>boolean</strong>: True/false conditionals (e.g., <code>boolean isCompleted = true;</code>)</li>
                                <li><strong>String</strong>: Object-based sequence of character strings.</li>
                            </ul>
                        `
            },
            {
                title: 'Conditional Loops & Operations',
                content: `
                            <h2 class="text-2xl font-bold mb-4">Conditionals & Loops Execution</h2>
                            <p class="mb-4">Conditional logic in Java relies on standard structures: <code>if</code>, <code>else if</code>, and <code>else</code> blocks.</p>
                            
                            <h3 class="text-lg font-bold mb-3">Code Example: For Loop Iteration</h3>
                            <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6 font-mono text-sm text-brand-400">
                                <span class="text-indigo-400">for</span> (<span class="text-indigo-400">int</span> i = 0; i &lt; 5; i++) {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="text-amber-300">"Count index: "</span> + i);<br>
                                }
                            </div>
                        `
            }
        ]
    },
    oop: {
        id: 'oop',
        title: 'Object Oriented Programming principles',
        difficulty: 'intermediate',
        author: 'Prof. Mark Sterling',
        chapters: [
            {
                title: 'Inheritance & Polymorphism basics',
                content: `
                            <h2 class="text-2xl font-bold mb-4">Understanding Classes & Inheritance</h2>
                            <p class="mb-4 text-slate-600 dark:text-slate-300">OOP is based on modularity. Inheritance allows a child class to extend base variables and methods from a parent class.</p>
                            
                            <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6 font-mono text-sm text-brand-400">
                                <span class="text-indigo-400">public class</span> <span class="text-emerald-400">Animal</span> {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">public void</span> speak() {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="text-amber-300">"Generic animal sound"</span>);<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;}<br>
                                }<br><br>
                                <span class="text-indigo-400">public class</span> <span class="text-emerald-400">Dog</span> <span class="text-indigo-400">extends</span> Animal {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-400">// Override keyword specifies customized child execution</span><br>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">@Override</span><br>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">public void</span> speak() {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="text-amber-300">"Woof! Woof!"</span>);<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;}<br>
                                }
                            </div>
                        `
            }
        ]
    },
    collections: {
        id: 'collections',
        title: 'Advanced Collections Framework',
        difficulty: 'advanced',
        author: 'Sarah Jenkins, Principal Architect',
        chapters: [
            {
                title: 'ArrayList, HashMap, and Performance',
                content: `
                            <h2 class="text-2xl font-bold mb-4">Mastering Java Collections</h2>
                            <p class="mb-4">The Collection Framework simplifies complex memory structure tasks. Key data collections include:</p>
                            <ul class="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>ArrayList</strong>: Dynamically resizable array list representation.</li>
                                <li><strong>HashMap</strong>: Custom Key-Value lookup tables.</li>
                            </ul>
                        `
            }
        ]
    }
};

const QUIZZES_DATABASE = {
    core: [
        {
            prompt: "Which data type would you use to store precise floating-point decimals in Java?",
            options: ["int", "double", "boolean", "char"],
            correct: 1
        },
        {
            prompt: "How do you check for string equality value equivalence?",
            options: ["str1 == str2", "str1.equals(str2)", "str1.compare(str2)", "str1 === str2"],
            correct: 1
        },
        {
            prompt: "Which structure handles error tracking safely?",
            options: ["if/else", "for loop", "try/catch", "switch"],
            correct: 2
        }
    ],
    exam: [
        {
            prompt: "What interface allows class instances to execute inside custom concurrent threads?",
            options: ["Runnable", "Serializable", "Cloneable", "Comparable"],
            correct: 0
        },
        {
            prompt: "Which dynamic container should you choose for fast O(1) custom key search?",
            options: ["ArrayList", "LinkedList", "HashMap", "Stack"],
            correct: 2
        },
        {
            prompt: "What OOP mechanism forces structural abstraction constraints across implementations?",
            options: ["Inheritance", "Interfaces", "Polymorphism", "Reflection"],
            correct: 1
        }
    ]
};

const TEMPLATE_CODES = {
    hello: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    variables: `public class Main {\n    public static void main(String[] args) {\n        int width = 10;\n        int height = 5;\n        int area = width * height;\n        System.out.println("The computed area is: " + area);\n    }\n}`,
    loops: `public class Main {\n    public static void main(String[] args) {\n        int[] values = {12, 45, 78, 23};\n        for (int x : values) {\n            System.out.println("Val: " + x);\n        }\n    }\n}`,
    oop: `public class Main {\n    public static void main(String[] args) {\n        Dog d = new Dog("Buster");\n        d.bark();\n    }\n}\n\nclass Dog {\n    String name;\n    public Dog(String name) {\n        this.name = name;\n    }\n    public void bark() {\n        System.out.println(name + " says: Woof!");\n    }\n}`
};
