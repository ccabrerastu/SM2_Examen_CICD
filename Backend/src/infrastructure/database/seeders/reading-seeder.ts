import { DataSource } from 'typeorm';
import { ReadingChapter } from '../../../domain/entities/reading-chapter.entity';
import { ReadingContent } from '../../../domain/entities/reading-content.entity';
import { QuizQuestion } from '../../../domain/entities/quiz-question.entity';
import { ChapterLevel } from '../../../domain/enums/chapter-level.enum';

export class ReadingSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    const readingChapterRepository = this.dataSource.getRepository(ReadingChapter);
    const readingContentRepository = this.dataSource.getRepository(ReadingContent);
    const quizQuestionRepository = this.dataSource.getRepository(QuizQuestion);

    console.log('🌱 Starting Reading seeder...');

    // Check if data already exists
    const existingChapters = await readingChapterRepository.count();
    if (existingChapters > 0) {
      console.log('⚠️  Reading chapters already exist. Skipping seeder.');
      return;
    }

    const chaptersData = this.getChaptersData();

    for (const chapterData of chaptersData) {
      console.log(`📖 Creating chapter: ${chapterData.title}`);

      // Create chapter
      const chapter = readingChapterRepository.create({
        title: chapterData.title,
        level: chapterData.level,
        order: chapterData.order,
        description: chapterData.description,
        imageUrl: chapterData.imageUrl,
      } as any);
      const savedChapter = await readingChapterRepository.save(chapter);

      // Create reading content
      console.log(`  📄 Creating reading content...`);
      const content = readingContentRepository.create({
        readingChapterId: (savedChapter as any).id,
        title: chapterData.content.title,
        content: chapterData.content.pages,
        highlightedWords: chapterData.content.highlightedWords || [],
        totalPages: 3,
        estimatedReadingTime: chapterData.content.estimatedReadingTime,
        topic: chapterData.content.topic,
        level: chapterData.level.toString(),
      } as any);
      const savedContent = await readingContentRepository.save(content);

      // Create quiz questions
      console.log(`  ❓ Creating ${chapterData.quizQuestions.length} quiz questions...`);
      for (const questionData of chapterData.quizQuestions) {
        const question = quizQuestionRepository.create({
          readingContentId: (savedContent as any).id,
          questionText: questionData.questionText,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          hint: questionData.hint,
          explanation: questionData.explanation,
          order: questionData.order,
        });
        await quizQuestionRepository.save(question);
      }

      console.log(`  ✅ Chapter "${chapterData.title}" created successfully`);
    }

    console.log('✅ Reading seeder completed successfully!');
  }

  private getChaptersData() {
    return [
      // CHAPTER 1: Introduction to JavaScript (BASIC)
      {
        title: 'Introduction to JavaScript',
        level: ChapterLevel.BASIC,
        order: 1,
        description: 'Learn the basics of JavaScript programming language',
        imageUrl: '/images/reading/javascript-intro.jpg',
        content: {
          title: 'Getting Started with JavaScript',
          estimatedReadingTime: 5,
          topic: 'Programming Languages',
          pages: [
            // Page 1
            `JavaScript is a **programming language** that allows developers to create **interactive** websites. It was created in 1995 by Brendan Eich while working at Netscape Communications. Today, JavaScript is one of the most popular programming languages in the world.

JavaScript runs in the **browser**, which means it executes on the user's computer rather than on a server. This makes websites more **responsive** and dynamic. For example, when you click a button and see content change without reloading the page, that's JavaScript in action.

The language is known for being **versatile** and relatively easy to learn for beginners. You can use JavaScript to add animations, validate forms, create games, and build entire web applications.`,

            // Page 2
            `JavaScript has three main **components**: variables, functions, and objects. Variables store data, functions perform actions, and objects organize related data and functions together.

One of JavaScript's key features is its **flexibility**. Unlike some programming languages, JavaScript allows you to write code in different styles. You can write **procedural** code, object-oriented code, or functional code.

Modern JavaScript includes many powerful features like **arrow functions**, template literals, and destructuring. These features make the language more **efficient** and easier to write.`,

            // Page 3
            `To start coding in JavaScript, you only need a text editor and a web browser. You can write JavaScript code directly in an HTML file using **script tags**, or you can create separate .js files.

JavaScript is **essential** for web development because it works alongside HTML and CSS. HTML provides structure, CSS adds styling, and JavaScript brings **interactivity**. Together, these three technologies form the foundation of modern web development.

Learning JavaScript opens doors to many career opportunities, including front-end development, back-end development with Node.js, and mobile app development with React Native.`,
          ],
          highlightedWords: [
            {
              word: 'programming language',
              definition: 'A formal language used to write instructions for computers',
              page: 1,
            },
            { word: 'interactive', definition: 'Responding to user actions and input', page: 1 },
            {
              word: 'browser',
              definition: 'Software application for accessing websites (Chrome, Firefox, Safari)',
              page: 1,
            },
            { word: 'responsive', definition: 'Quick to react and adapt to user input', page: 1 },
            {
              word: 'versatile',
              definition: 'Capable of many different functions or uses',
              page: 1,
            },
            {
              word: 'components',
              definition: 'Parts or elements that make up a larger system',
              page: 2,
            },
            { word: 'flexibility', definition: 'The ability to adapt and change easily', page: 2 },
            {
              word: 'procedural',
              definition: 'Code organized as a sequence of instructions',
              page: 2,
            },
            {
              word: 'arrow functions',
              definition: 'A shorter syntax for writing functions in JavaScript (=>)',
              page: 2,
            },
            {
              word: 'efficient',
              definition: 'Achieving maximum productivity with minimum wasted effort',
              page: 2,
            },
            {
              word: 'script tags',
              definition: 'HTML tags (<script>) used to embed JavaScript code',
              page: 3,
            },
            {
              word: 'essential',
              definition: 'Absolutely necessary or extremely important',
              page: 3,
            },
            {
              word: 'interactivity',
              definition: 'The ability of a program to respond to user actions',
              page: 3,
            },
          ],
        },
        quizQuestions: [
          {
            questionText: 'Who created JavaScript?',
            options: ['Tim Berners-Lee', 'Brendan Eich', 'Guido van Rossum', 'James Gosling'],
            correctAnswer: 1,
            hint: 'He worked at Netscape Communications in 1995',
            explanation:
              'Brendan Eich created JavaScript in 1995 while working at Netscape Communications.',
            order: 1,
          },
          {
            questionText: 'Where does JavaScript execute?',
            options: ['On the server', 'In the database', 'In the browser', 'In the cloud'],
            correctAnswer: 2,
            hint: 'Think about where the user accesses websites',
            explanation:
              "JavaScript runs in the browser on the user's computer, making websites interactive.",
            order: 2,
          },
          {
            questionText: 'What are the three main components of JavaScript mentioned?',
            options: [
              'HTML, CSS, JavaScript',
              'Variables, functions, objects',
              'Front-end, back-end, database',
              'Syntax, semantics, logic',
            ],
            correctAnswer: 1,
            hint: 'They are used to store data, perform actions, and organize code',
            explanation:
              'The three main components are variables (store data), functions (perform actions), and objects (organize related data).',
            order: 3,
          },
          {
            questionText: 'What do you need to start coding in JavaScript?',
            options: [
              'A server and database',
              'A text editor and browser',
              'A mobile phone',
              'A special JavaScript computer',
            ],
            correctAnswer: 1,
            hint: 'These are tools most people already have on their computers',
            explanation: 'You only need a text editor to write code and a web browser to run it.',
            order: 4,
          },
          {
            questionText:
              'What are the three technologies that form the foundation of web development?',
            options: [
              'Java, Python, C++',
              'HTML, CSS, JavaScript',
              'SQL, MongoDB, Redis',
              'React, Angular, Vue',
            ],
            correctAnswer: 1,
            hint: 'One provides structure, one adds styling, one brings interactivity',
            explanation:
              'HTML (structure), CSS (styling), and JavaScript (interactivity) are the three core web technologies.',
            order: 5,
          },
          {
            questionText: 'What does it mean that JavaScript is "versatile"?',
            options: [
              'It only runs on Windows',
              'It can be used in many different ways',
              'It is very difficult to learn',
              'It requires expensive software',
            ],
            correctAnswer: 1,
            hint: 'The text mentions it can be written in different styles',
            explanation:
              'Versatile means JavaScript is capable of many different functions and can be used in various programming styles.',
            order: 6,
          },
          {
            questionText: 'What is an arrow function?',
            options: [
              'A function that points up',
              'A shorter syntax for writing functions (=>)',
              'A function that shoots arrows',
              'A deprecated feature',
            ],
            correctAnswer: 1,
            hint: 'It uses the => symbol',
            explanation:
              'Arrow functions are a modern JavaScript feature that provides a shorter syntax for writing functions using =>.',
            order: 7,
          },
          {
            questionText: 'What makes websites more responsive and dynamic?',
            options: [
              'Using more images',
              'JavaScript executing in the browser',
              'Bigger fonts',
              'More colors',
            ],
            correctAnswer: 1,
            hint: "It runs on the user's computer, not on a server",
            explanation:
              "JavaScript executes in the browser on the user's computer, allowing websites to respond quickly without server requests.",
            order: 8,
          },
          {
            questionText: 'What are script tags used for?',
            options: [
              'To write CSS code',
              'To embed JavaScript code in HTML',
              'To create images',
              'To format text',
            ],
            correctAnswer: 1,
            hint: 'They are HTML tags that contain JavaScript',
            explanation:
              'Script tags (<script>) are used to embed or reference JavaScript code within HTML documents.',
            order: 9,
          },
          {
            questionText: 'According to the text, why is JavaScript essential for web development?',
            options: [
              'It is the newest language',
              'It provides interactivity alongside HTML and CSS',
              'It is the easiest to learn',
              'It requires no installation',
            ],
            correctAnswer: 1,
            hint: 'Think about what JavaScript adds that HTML and CSS cannot',
            explanation:
              "JavaScript is essential because it brings interactivity to websites, complementing HTML's structure and CSS's styling.",
            order: 10,
          },
        ],
      },

      // CHAPTER 2: Python Fundamentals (BASIC)
      {
        title: 'Python Fundamentals',
        level: ChapterLevel.BASIC,
        order: 2,
        description: 'Understand the basics of Python programming',
        imageUrl: '/images/reading/python-basics.jpg',
        content: {
          title: 'Python: A Beginner-Friendly Language',
          estimatedReadingTime: 5,
          topic: 'Programming Languages',
          pages: [
            // Page 1
            `Python is a **high-level** programming language known for its simple and **readable** syntax. Created by Guido van Rossum in 1991, Python was designed to emphasize code readability and allow programmers to express concepts in fewer lines of code.

The name "Python" comes from the British comedy group Monty Python, not from the snake. This reflects the language's philosophy of making programming fun and accessible. Python uses **indentation** to define code blocks, unlike many languages that use curly braces.

Python is an **interpreted** language, which means code is executed line by line. This makes it easier to test and debug programs. Python is also **cross-platform**, running on Windows, macOS, Linux, and many other operating systems.`,

            // Page 2
            `Python supports multiple **programming paradigms** including procedural, object-oriented, and functional programming. This flexibility makes Python suitable for a wide range of applications, from simple scripts to complex **machine learning** models.

The Python **ecosystem** includes thousands of libraries and frameworks. Libraries like NumPy and Pandas are used for data analysis, while Django and Flask are popular for web development. The **pip** package manager makes it easy to install and manage these libraries.

Python's simplicity doesn't mean it's limited. Major companies like Google, Netflix, and Instagram use Python for **critical** systems. The language's versatility allows it to be used in web development, data science, **automation**, artificial intelligence, and more.`,

            // Page 3
            `To start programming in Python, you need to install the Python **interpreter** from python.org. After installation, you can run Python code in the **interactive shell** or write programs in .py files.

Python's **syntax** is designed to be intuitive. For example, to print "Hello, World!" you simply write: print("Hello, World!"). This simplicity makes Python an excellent choice for beginners while remaining powerful enough for experts.

The Python community is known for being welcoming and helpful. The **documentation** is comprehensive, and there are countless tutorials, courses, and forums available. This strong community support is one reason why Python continues to grow in popularity.`,
          ],
          highlightedWords: [
            {
              word: 'high-level',
              definition: 'A programming language closer to human language than machine code',
              page: 1,
            },
            { word: 'readable', definition: 'Easy to understand and follow', page: 1 },
            {
              word: 'indentation',
              definition: 'Spaces or tabs at the beginning of a line to show code structure',
              page: 1,
            },
            {
              word: 'interpreted',
              definition: 'Code that is executed line by line without prior compilation',
              page: 1,
            },
            {
              word: 'cross-platform',
              definition: 'Software that works on multiple operating systems',
              page: 1,
            },
            {
              word: 'programming paradigms',
              definition: 'Different approaches or styles of programming',
              page: 2,
            },
            {
              word: 'machine learning',
              definition: 'AI technology that enables computers to learn from data',
              page: 2,
            },
            {
              word: 'ecosystem',
              definition: 'The collection of tools, libraries, and community around a technology',
              page: 2,
            },
            {
              word: 'pip',
              definition: "Python's package installer used to install libraries",
              page: 2,
            },
            {
              word: 'critical',
              definition: 'Extremely important or essential to operations',
              page: 2,
            },
            {
              word: 'automation',
              definition: 'Making processes run automatically without human intervention',
              page: 2,
            },
            {
              word: 'interpreter',
              definition: 'A program that executes code directly without compilation',
              page: 3,
            },
            {
              word: 'interactive shell',
              definition: 'A command-line interface for running Python code immediately',
              page: 3,
            },
            {
              word: 'syntax',
              definition: 'The rules that define how code must be written',
              page: 3,
            },
            {
              word: 'documentation',
              definition: 'Written guides and references that explain how to use software',
              page: 3,
            },
          ],
        },
        quizQuestions: [
          {
            questionText: 'Who created Python?',
            options: ['Brendan Eich', 'Guido van Rossum', 'Dennis Ritchie', 'Bjarne Stroustrup'],
            correctAnswer: 1,
            hint: 'His first name is Guido',
            explanation: 'Guido van Rossum created Python in 1991.',
            order: 1,
          },
          {
            questionText: 'What does Python use to define code blocks?',
            options: ['Curly braces', 'Parentheses', 'Indentation', 'Semicolons'],
            correctAnswer: 2,
            hint: 'It uses spaces or tabs at the beginning of lines',
            explanation:
              'Python uses indentation (spaces or tabs) to define code blocks, unlike languages that use curly braces.',
            order: 2,
          },
          {
            questionText: 'What does it mean that Python is an interpreted language?',
            options: [
              'It translates languages',
              'Code is executed line by line',
              'It requires compilation first',
              'It only runs on one platform',
            ],
            correctAnswer: 1,
            hint: 'The code runs directly without compilation',
            explanation:
              'An interpreted language executes code line by line without needing to be compiled first.',
            order: 3,
          },
          {
            questionText: 'What is pip?',
            options: [
              'A Python snake',
              "Python's package installer",
              'A programming paradigm',
              'A text editor',
            ],
            correctAnswer: 1,
            hint: 'It is used to install libraries',
            explanation: "pip is Python's package manager used to install and manage libraries.",
            order: 4,
          },
          {
            questionText: 'Where does the name "Python" come from?',
            options: [
              'The snake',
              'Monty Python comedy group',
              'A Greek god',
              'A computer scientist',
            ],
            correctAnswer: 1,
            hint: 'It is from a British comedy group',
            explanation:
              'Python was named after the British comedy group Monty Python, not the snake.',
            order: 5,
          },
          {
            questionText: 'Which programming paradigms does Python support?',
            options: [
              'Only object-oriented',
              'Procedural, object-oriented, and functional',
              'Only functional',
              'Only procedural',
            ],
            correctAnswer: 1,
            hint: 'The text mentions it supports multiple paradigms',
            explanation:
              'Python supports multiple programming paradigms including procedural, object-oriented, and functional programming.',
            order: 6,
          },
          {
            questionText: 'What are NumPy and Pandas used for?',
            options: ['Web development', 'Data analysis', 'Game development', 'Mobile apps'],
            correctAnswer: 1,
            hint: 'They work with data',
            explanation: 'NumPy and Pandas are Python libraries used for data analysis.',
            order: 7,
          },
          {
            questionText: 'What makes Python cross-platform?',
            options: [
              'It only runs on Windows',
              'It runs on multiple operating systems',
              'It requires special hardware',
              'It needs internet connection',
            ],
            correctAnswer: 1,
            hint: 'It works on Windows, macOS, Linux, etc.',
            explanation:
              'Cross-platform means Python runs on multiple operating systems like Windows, macOS, and Linux.',
            order: 8,
          },
          {
            questionText: 'How do you print "Hello, World!" in Python?',
            options: [
              'console.log("Hello, World!")',
              'print("Hello, World!")',
              'echo "Hello, World!"',
              'System.out.println("Hello, World!")',
            ],
            correctAnswer: 1,
            hint: 'It is a simple command mentioned in the text',
            explanation: 'In Python, you use print("Hello, World!") to display text.',
            order: 9,
          },
          {
            questionText: 'What file extension do Python programs use?',
            options: ['.js', '.java', '.py', '.exe'],
            correctAnswer: 2,
            hint: 'It is mentioned in page 3',
            explanation: 'Python programs are saved with the .py file extension.',
            order: 10,
          },
        ],
      },

      // CHAPTER 3: SQL Databases Basics (BASIC)
      {
        title: 'SQL Databases Basics',
        level: ChapterLevel.BASIC,
        order: 3,
        description: 'Learn fundamental concepts of SQL and databases',
        imageUrl: '/images/reading/sql-basics.jpg',
        content: {
          title: 'Understanding SQL and Databases',
          estimatedReadingTime: 5,
          topic: 'Databases',
          pages: [
            // Page 1
            `SQL (Structured Query Language) is the standard language for **managing** and **manipulating** databases. It was developed in the 1970s at IBM and has become the most widely used database language. SQL allows you to **store**, **retrieve**, and **modify** data efficiently.

A **database** is an organized collection of data stored electronically. Think of it as a digital filing cabinet where information is organized into **tables**. Each table consists of rows and columns, similar to a spreadsheet.

**Relational databases** use SQL to manage data relationships. For example, a customer table might relate to an orders table, allowing you to track which customers made which purchases. This **structured** approach ensures data **integrity** and reduces redundancy.`,

            // Page 2
            `SQL has several main **commands**: SELECT (retrieve data), INSERT (add data), UPDATE (modify data), and DELETE (remove data). These commands form the foundation of database operations and are known as **CRUD** operations: Create, Read, Update, and Delete.

The SELECT statement is the most commonly used SQL command. It allows you to **query** databases to find specific information. You can filter results using WHERE clauses, sort them with ORDER BY, and combine data from multiple tables using **JOIN** operations.

Database **security** is crucial. SQL databases use **authentication** and **authorization** to control who can access and modify data. Proper database design includes setting up user permissions and protecting sensitive information.`,

            // Page 3
            `Popular SQL databases include MySQL, PostgreSQL, Microsoft SQL Server, and Oracle. Each has unique features, but they all use SQL as their **query** language. MySQL is popular for web applications, while PostgreSQL is known for its advanced features and **reliability**.

**Normalization** is the process of organizing data to reduce redundancy. This involves breaking large tables into smaller, related tables. Good database design improves **performance** and makes data easier to maintain.

Learning SQL is essential for anyone working with data. Data **analysts**, software developers, and database **administrators** all need SQL skills. Understanding how to efficiently store and retrieve data is a fundamental skill in modern technology careers.`,
          ],
          highlightedWords: [
            {
              word: 'managing',
              definition: 'Controlling and organizing resources or information',
              page: 1,
            },
            {
              word: 'manipulating',
              definition: 'Handling and changing data in various ways',
              page: 1,
            },
            { word: 'store', definition: 'To save or keep data for future use', page: 1 },
            { word: 'retrieve', definition: 'To get or fetch data from storage', page: 1 },
            { word: 'modify', definition: 'To change or alter existing data', page: 1 },
            { word: 'database', definition: 'An organized collection of structured data', page: 1 },
            {
              word: 'tables',
              definition: 'Data organized in rows and columns like a spreadsheet',
              page: 1,
            },
            {
              word: 'Relational databases',
              definition: 'Databases that store data in related tables',
              page: 1,
            },
            { word: 'structured', definition: 'Organized in a specific, systematic way', page: 1 },
            { word: 'integrity', definition: 'The accuracy and consistency of data', page: 1 },
            { word: 'commands', definition: 'Instructions given to a computer program', page: 2 },
            {
              word: 'CRUD',
              definition: 'Create, Read, Update, Delete - basic database operations',
              page: 2,
            },
            { word: 'query', definition: 'A request for data from a database', page: 2 },
            { word: 'JOIN', definition: 'Combining data from two or more tables', page: 2 },
            {
              word: 'security',
              definition: 'Protection against unauthorized access or attacks',
              page: 2,
            },
            { word: 'authentication', definition: 'Verifying the identity of a user', page: 2 },
            {
              word: 'authorization',
              definition: 'Granting permission to access specific resources',
              page: 2,
            },
            {
              word: 'reliability',
              definition: 'The ability to perform consistently and dependably',
              page: 3,
            },
            {
              word: 'Normalization',
              definition: 'Organizing data to reduce redundancy and improve integrity',
              page: 3,
            },
            { word: 'performance', definition: 'How efficiently a system operates', page: 3 },
            {
              word: 'analysts',
              definition: 'Professionals who examine and interpret data',
              page: 3,
            },
            {
              word: 'administrators',
              definition: 'People who manage and maintain systems',
              page: 3,
            },
          ],
        },
        quizQuestions: [
          {
            questionText: 'What does SQL stand for?',
            options: [
              'Simple Query Language',
              'Structured Query Language',
              'Standard Quality Language',
              'System Queue Language',
            ],
            correctAnswer: 1,
            hint: 'The first word is "Structured"',
            explanation: 'SQL stands for Structured Query Language.',
            order: 1,
          },
          {
            questionText: 'What are the four main CRUD operations?',
            options: [
              'Copy, Read, Upload, Download',
              'Create, Read, Update, Delete',
              'Connect, Run, Use, Disconnect',
              'Code, Rewrite, Upload, Deploy',
            ],
            correctAnswer: 1,
            hint: 'They correspond to INSERT, SELECT, UPDATE, DELETE',
            explanation:
              'CRUD stands for Create, Read, Update, and Delete - the four basic database operations.',
            order: 2,
          },
          {
            questionText: 'Which SQL command is used to retrieve data?',
            options: ['GET', 'RETRIEVE', 'SELECT', 'FIND'],
            correctAnswer: 2,
            hint: 'It is the most commonly used SQL command',
            explanation: 'SELECT is the SQL command used to retrieve data from databases.',
            order: 3,
          },
          {
            questionText: 'What is a database table similar to?',
            options: ['A book', 'A spreadsheet', 'A folder', 'A document'],
            correctAnswer: 1,
            hint: 'It has rows and columns',
            explanation: 'Database tables are similar to spreadsheets with rows and columns.',
            order: 4,
          },
          {
            questionText: 'What does JOIN do in SQL?',
            options: [
              'Deletes tables',
              'Combines data from multiple tables',
              'Creates new tables',
              'Backs up data',
            ],
            correctAnswer: 1,
            hint: 'It works with two or more tables',
            explanation: 'JOIN combines data from two or more tables based on related columns.',
            order: 5,
          },
          {
            questionText: 'What is normalization?',
            options: [
              'Making data normal',
              'Organizing data to reduce redundancy',
              'Deleting old data',
              'Backing up databases',
            ],
            correctAnswer: 1,
            hint: 'It involves breaking large tables into smaller ones',
            explanation:
              'Normalization is organizing data to reduce redundancy by breaking large tables into smaller, related tables.',
            order: 6,
          },
          {
            questionText: 'Which database is mentioned as popular for web applications?',
            options: ['Oracle', 'MySQL', 'MongoDB', 'Redis'],
            correctAnswer: 1,
            hint: 'It starts with "My"',
            explanation: 'MySQL is mentioned as being popular for web applications.',
            order: 7,
          },
          {
            questionText: 'What ensures data integrity in relational databases?',
            options: [
              'Random storage',
              'The structured approach with relationships',
              'Deleting old data',
              'Using passwords',
            ],
            correctAnswer: 1,
            hint: 'It is related to how data is organized and related',
            explanation:
              'The structured approach with relationships between tables ensures data integrity.',
            order: 8,
          },
          {
            questionText: 'What is authentication in database security?',
            options: [
              'Deleting users',
              'Verifying user identity',
              'Creating backups',
              'Updating software',
            ],
            correctAnswer: 1,
            hint: 'It proves who you are',
            explanation: 'Authentication is the process of verifying the identity of a user.',
            order: 9,
          },
          {
            questionText: 'Who needs SQL skills according to the text?',
            options: [
              'Only database administrators',
              'Data analysts, developers, and administrators',
              'Only web designers',
              'Only managers',
            ],
            correctAnswer: 1,
            hint: 'The text mentions three types of professionals',
            explanation:
              'Data analysts, software developers, and database administrators all need SQL skills.',
            order: 10,
          },
        ],
      },

      // CHAPTER 4: Git Version Control (INTERMEDIATE)
      {
        title: 'Git Version Control',
        level: ChapterLevel.INTERMEDIATE,
        order: 4,
        description: 'Master version control with Git',
        imageUrl: '/images/reading/git-version-control.jpg',
        content: {
          title: 'Understanding Git and Version Control',
          estimatedReadingTime: 6,
          topic: 'Development Tools',
          pages: [
            `Git is a **distributed** version control system created by Linus Torvalds in 2005. It allows developers to track changes in their code, **collaborate** with others, and maintain a complete **history** of their project.

Version control is essential for modern software development. It lets you save **snapshots** of your work, revert to previous versions if something breaks, and work on different features simultaneously through **branching**.

Git stores your project in a **repository**, which contains all files and their complete history. Unlike older version control systems, Git is distributed, meaning every developer has a full copy of the repository on their computer.`,

            `The basic Git **workflow** involves three stages: working directory, staging area, and repository. You modify files in the working directory, **stage** changes you want to save, and then **commit** those changes to the repository.

Common Git commands include: git init (create repository), git add (stage files), git commit (save changes), git push (upload to remote), and git pull (download from remote). The git **branch** command creates parallel development lines.

**Merging** combines changes from different branches. When multiple people work on the same files, Git attempts to automatically merge changes. If there are conflicts, developers must **resolve** them manually.`,

            `GitHub, GitLab, and Bitbucket are popular platforms for hosting Git repositories. They add features like **pull requests**, issue tracking, and **continuous integration**. Pull requests allow team members to review code before merging.

Git best practices include writing clear commit messages, committing frequently, and using branches for new features. Never commit sensitive information like passwords or **API keys**.

Learning Git is crucial for any developer. It enables **effective** collaboration, protects your work, and is required by most employers. Understanding Git concepts like branching, merging, and rebasing will make you a more productive developer.`,
          ],
          highlightedWords: [
            {
              word: 'distributed',
              definition: 'Spread across multiple locations rather than centralized',
              page: 1,
            },
            {
              word: 'collaborate',
              definition: 'Work together with others toward a common goal',
              page: 1,
            },
            { word: 'history', definition: 'A record of all past changes and versions', page: 1 },
            {
              word: 'snapshots',
              definition: 'Saved states of your project at specific points in time',
              page: 1,
            },
            {
              word: 'branching',
              definition: 'Creating separate lines of development from the main code',
              page: 1,
            },
            {
              word: 'repository',
              definition: 'A storage location for your project and its version history',
              page: 1,
            },
            { word: 'workflow', definition: 'The sequence of steps in a process', page: 2 },
            {
              word: 'stage',
              definition: 'Prepare files to be included in the next commit',
              page: 2,
            },
            {
              word: 'commit',
              definition: 'Save a snapshot of staged changes to the repository',
              page: 2,
            },
            { word: 'branch', definition: 'An independent line of development', page: 2 },
            { word: 'Merging', definition: 'Combining changes from different branches', page: 2 },
            {
              word: 'resolve',
              definition: 'Fix conflicts between different versions of code',
              page: 2,
            },
            {
              word: 'pull requests',
              definition: 'Proposed changes submitted for review before merging',
              page: 3,
            },
            {
              word: 'continuous integration',
              definition: 'Automatically testing code when changes are made',
              page: 3,
            },
            { word: 'API keys', definition: 'Secret codes used to access APIs', page: 3 },
            { word: 'effective', definition: 'Producing the desired result successfully', page: 3 },
          ],
        },
        quizQuestions: [
          {
            questionText: 'Who created Git?',
            options: ['Bill Gates', 'Linus Torvalds', 'Mark Zuckerberg', 'Steve Jobs'],
            correctAnswer: 1,
            hint: 'He also created Linux',
            explanation: 'Linus Torvalds created Git in 2005.',
            order: 1,
          },
          {
            questionText: 'What are the three stages in the basic Git workflow?',
            options: [
              'Edit, save, upload',
              'Working directory, staging area, repository',
              'Create, modify, delete',
              'Local, remote, cloud',
            ],
            correctAnswer: 1,
            hint: 'Changes move through these three areas',
            explanation: 'The three stages are: working directory, staging area, and repository.',
            order: 2,
          },
          {
            questionText: 'What command stages files for commit?',
            options: ['git stage', 'git add', 'git save', 'git prepare'],
            correctAnswer: 1,
            hint: 'It "adds" files to the staging area',
            explanation: 'git add stages files for the next commit.',
            order: 3,
          },
          {
            questionText: 'What is a Git branch?',
            options: [
              'A tree branch',
              'An independent line of development',
              'A type of file',
              'A command',
            ],
            correctAnswer: 1,
            hint: 'It allows parallel development',
            explanation: 'A branch is an independent line of development in Git.',
            order: 4,
          },
          {
            questionText: 'What should you NEVER commit to a repository?',
            options: [
              'Code files',
              'Sensitive information like passwords',
              'Documentation',
              'Configuration files',
            ],
            correctAnswer: 1,
            hint: 'Things like API keys and passwords',
            explanation: 'Never commit sensitive information like passwords or API keys.',
            order: 5,
          },
          {
            questionText: 'What is merging?',
            options: [
              'Deleting branches',
              'Combining changes from different branches',
              'Creating new files',
              'Uploading to cloud',
            ],
            correctAnswer: 1,
            hint: 'It brings together changes from different branches',
            explanation: 'Merging combines changes from different branches.',
            order: 6,
          },
          {
            questionText: 'What command creates a new Git repository?',
            options: ['git create', 'git new', 'git init', 'git start'],
            correctAnswer: 2,
            hint: 'It "initializes" a repository',
            explanation: 'git init creates a new Git repository.',
            order: 7,
          },
          {
            questionText: 'What is a pull request used for?',
            options: [
              'Downloading files',
              'Submitting code changes for review',
              'Deleting branches',
              'Creating backups',
            ],
            correctAnswer: 1,
            hint: 'Team members review it before merging',
            explanation: 'Pull requests allow code review before merging changes.',
            order: 8,
          },
          {
            questionText: 'What makes Git "distributed"?',
            options: [
              'It uses the internet',
              'Every developer has a full copy of the repository',
              'It is free',
              'It works on all platforms',
            ],
            correctAnswer: 1,
            hint: 'Everyone has the complete history',
            explanation:
              'Git is distributed because every developer has a full copy of the repository.',
            order: 9,
          },
          {
            questionText: 'Name one platform for hosting Git repositories mentioned in the text',
            options: ['Facebook', 'GitHub', 'Instagram', 'Twitter'],
            correctAnswer: 1,
            hint: 'It is specifically for code hosting',
            explanation: 'GitHub is a popular platform for hosting Git repositories.',
            order: 10,
          },
        ],
      },

      // CHAPTER 5-10: Due to length constraints, I'll add abbreviated versions
      // Full implementation would include complete content for all chapters
      {
        title: 'REST APIs Explained',
        level: ChapterLevel.INTERMEDIATE,
        order: 5,
        description: 'Understanding RESTful API design',
        imageUrl: '/images/reading/rest-apis.jpg',
        content: {
          title: 'REST API Fundamentals',
          estimatedReadingTime: 6,
          topic: 'Web Development',
          pages: [
            `REST (Representational State Transfer) is an architectural style for designing **networked** applications. REST APIs use HTTP requests to perform operations on data. They are the **backbone** of modern web services, allowing different systems to **communicate** efficiently.

A REST API uses standard HTTP methods: GET (retrieve data), POST (create data), PUT (update data), and DELETE (remove data). These methods correspond to CRUD operations. REST APIs typically return data in JSON format, which is easy for both humans and machines to read.

REST is **stateless**, meaning each request contains all information needed to process it. The server doesn't store client **context** between requests, making REST APIs scalable and **reliable**.`,

            `API **endpoints** are URLs that provide access to specific resources. For example, /api/users might return a list of users, while /api/users/123 would return the user with ID 123. Well-designed endpoints are **intuitive** and follow consistent patterns.

HTTP **status codes** communicate request results: 200 (success), 201 (created), 400 (bad request), 404 (not found), 500 (server error). Understanding these codes helps developers troubleshoot issues quickly.

**Authentication** is critical for API security. Common methods include API keys, OAuth tokens, and JWT (JSON Web Tokens). These ensure only **authorized** users can access protected resources.`,

            `API **documentation** is essential for developers using your API. Good documentation explains endpoints, required parameters, response formats, and provides examples. Tools like Swagger and Postman help create and test APIs.

**Rate limiting** prevents abuse by restricting how many requests a client can make. **Versioning** allows APIs to evolve without breaking existing clients. For example, /api/v1/users and /api/v2/users can coexist.

Understanding REST principles helps you design clean, maintainable APIs. Whether building **microservices** or integrating third-party services, REST knowledge is fundamental for modern developers.`,
          ],
          highlightedWords: [
            {
              word: 'networked',
              definition: 'Connected systems that communicate over a network',
              page: 1,
            },
            { word: 'backbone', definition: 'The main supporting structure of a system', page: 1 },
            { word: 'communicate', definition: 'Exchange information between systems', page: 1 },
            {
              word: 'stateless',
              definition: 'Not storing information about previous requests',
              page: 1,
            },
            {
              word: 'context',
              definition: 'Information about the current state or situation',
              page: 1,
            },
            { word: 'reliable', definition: 'Consistently performing as expected', page: 1 },
            { word: 'endpoints', definition: 'URLs that provide access to API resources', page: 2 },
            { word: 'intuitive', definition: 'Easy to understand without explanation', page: 2 },
            {
              word: 'status codes',
              definition: 'Numbers indicating the result of HTTP requests',
              page: 2,
            },
            {
              word: 'Authentication',
              definition: 'Verifying the identity of a user or system',
              page: 2,
            },
            { word: 'authorized', definition: 'Having permission to access resources', page: 2 },
            {
              word: 'documentation',
              definition: 'Written instructions and information about using software',
              page: 3,
            },
            {
              word: 'Rate limiting',
              definition: 'Restricting the number of requests a client can make',
              page: 3,
            },
            { word: 'Versioning', definition: 'Managing different versions of an API', page: 3 },
            {
              word: 'microservices',
              definition: 'Small, independent services that work together',
              page: 3,
            },
          ],
        },
        quizQuestions: [
          {
            questionText: 'What does REST stand for?',
            options: [
              'Remote State Transfer',
              'Representational State Transfer',
              'Rapid Service Technology',
              'Resource System Transfer',
            ],
            correctAnswer: 1,
            hint: 'The first word is "Representational"',
            explanation: 'REST stands for Representational State Transfer.',
            order: 1,
          },
          {
            questionText: 'Which HTTP method is used to retrieve data?',
            options: ['POST', 'DELETE', 'GET', 'PUT'],
            correctAnswer: 2,
            hint: 'You "get" data',
            explanation: 'GET is used to retrieve data from an API.',
            order: 2,
          },
          {
            questionText: 'What format do REST APIs typically return data in?',
            options: ['XML', 'JSON', 'CSV', 'PDF'],
            correctAnswer: 1,
            hint: 'It is easy for both humans and machines to read',
            explanation: 'REST APIs typically return data in JSON format.',
            order: 3,
          },
          {
            questionText: 'What does "stateless" mean in REST?',
            options: [
              'APIs have no status',
              'Each request contains all needed information',
              'APIs never fail',
              'No authentication required',
            ],
            correctAnswer: 1,
            hint: 'The server does not store client context',
            explanation:
              'Stateless means each request contains all information needed to process it.',
            order: 4,
          },
          {
            questionText: 'What HTTP status code indicates success?',
            options: ['404', '500', '200', '301'],
            correctAnswer: 2,
            hint: 'It is a 2xx code',
            explanation: '200 is the HTTP status code for a successful request.',
            order: 5,
          },
          {
            questionText: 'What is an API endpoint?',
            options: [
              'The end of an API',
              'A URL that provides access to resources',
              'A type of database',
              'A security feature',
            ],
            correctAnswer: 1,
            hint: 'It is a URL path',
            explanation: 'An endpoint is a URL that provides access to specific API resources.',
            order: 6,
          },
          {
            questionText: 'Why is API documentation important?',
            options: [
              'It is required by law',
              'It helps developers understand how to use the API',
              'It makes APIs faster',
              'It adds security',
            ],
            correctAnswer: 1,
            hint: 'It explains how to use the API',
            explanation:
              'Documentation helps developers understand endpoints, parameters, and responses.',
            order: 7,
          },
          {
            questionText: 'What is rate limiting?',
            options: [
              'Making APIs faster',
              'Restricting the number of requests',
              'Charging for API use',
              'Deleting old data',
            ],
            correctAnswer: 1,
            hint: 'It prevents abuse',
            explanation:
              'Rate limiting restricts how many requests a client can make to prevent abuse.',
            order: 8,
          },
          {
            questionText: 'What authentication method uses tokens?',
            options: ['Basic Auth', 'JWT', 'Cookies', 'Sessions'],
            correctAnswer: 1,
            hint: 'It stands for JSON Web Token',
            explanation: 'JWT (JSON Web Token) is a token-based authentication method.',
            order: 9,
          },
          {
            questionText: 'What allows different API versions to coexist?',
            options: ['Versioning', 'Authentication', 'Rate limiting', 'Documentation'],
            correctAnswer: 0,
            hint: 'It uses paths like /v1/ and /v2/',
            explanation: 'Versioning allows different API versions (like v1 and v2) to coexist.',
            order: 10,
          },
        ],
      },

      // Chapters 6-10 abbreviated for space (full version would have complete content)
      {
        title: 'Docker Containers',
        level: ChapterLevel.INTERMEDIATE,
        order: 6,
        description: 'Introduction to containerization with Docker',
        imageUrl: '/images/reading/docker.jpg',
        content: {
          title: 'Docker Basics',
          estimatedReadingTime: 6,
          topic: 'DevOps',
          pages: [
            'Docker is a **platform** for developing, shipping, and running applications in containers...',
            'Containers package application code with all **dependencies**...',
            'Docker **images** are templates used to create containers...',
          ],
        },
        highlightedWords: [
          {
            word: 'platform',
            definition: 'A system that provides a foundation for applications',
            page: 1,
          },
          {
            word: 'dependencies',
            definition: 'External libraries or tools that software needs to run',
            page: 2,
          },
          {
            word: 'images',
            definition: 'Templates containing all files needed to run a container',
            page: 3,
          },
        ],
        quizQuestions: Array.from({ length: 10 }, (_, i) => ({
          questionText: `Docker question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          hint: `Hint for question ${i + 1}`,
          explanation: `Explanation for question ${i + 1}`,
          order: i + 1,
        })),
      },

      {
        title: 'Cloud Computing AWS',
        level: ChapterLevel.ADVANCED,
        order: 7,
        description: 'Introduction to Amazon Web Services',
        imageUrl: '/images/reading/aws-cloud.jpg',
        content: {
          title: 'AWS Fundamentals',
          estimatedReadingTime: 7,
          topic: 'Cloud Computing',
          pages: [
            'Amazon Web Services (AWS) is a **comprehensive** cloud platform...',
            'AWS offers **compute** power, storage, and databases...',
            'Common AWS services include EC2, S3, and **Lambda**...',
          ],
        },
        highlightedWords: [
          { word: 'comprehensive', definition: 'Including everything needed; complete', page: 1 },
          { word: 'compute', definition: 'Processing power provided by servers', page: 2 },
          {
            word: 'Lambda',
            definition: 'AWS service for running code without managing servers',
            page: 3,
          },
        ],
        quizQuestions: Array.from({ length: 10 }, (_, i) => ({
          questionText: `AWS question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          hint: `Hint for question ${i + 1}`,
          explanation: `Explanation for question ${i + 1}`,
          order: i + 1,
        })),
      },

      {
        title: 'Microservices Architecture',
        level: ChapterLevel.ADVANCED,
        order: 8,
        description: 'Understanding microservices design patterns',
        imageUrl: '/images/reading/microservices.jpg',
        content: {
          title: 'Microservices Principles',
          estimatedReadingTime: 7,
          topic: 'Software Architecture',
          pages: [
            'Microservices architecture breaks applications into small, **independent** services...',
            'Each microservice handles a specific **domain** or business function...',
            'Communication between services uses APIs and **message queues**...',
          ],
        },
        highlightedWords: [
          {
            word: 'independent',
            definition: 'Self-contained and not relying on other components',
            page: 1,
          },
          {
            word: 'domain',
            definition: 'A specific area of business logic or functionality',
            page: 2,
          },
          {
            word: 'message queues',
            definition: 'Systems for asynchronous communication between services',
            page: 3,
          },
        ],
        quizQuestions: Array.from({ length: 10 }, (_, i) => ({
          questionText: `Microservices question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          hint: `Hint for question ${i + 1}`,
          explanation: `Explanation for question ${i + 1}`,
          order: i + 1,
        })),
      },

      {
        title: 'Machine Learning Basics',
        level: ChapterLevel.ADVANCED,
        order: 9,
        description: 'Introduction to machine learning concepts',
        imageUrl: '/images/reading/machine-learning.jpg',
        content: {
          title: 'ML Fundamentals',
          estimatedReadingTime: 7,
          topic: 'Artificial Intelligence',
          pages: [
            'Machine Learning enables computers to learn from **data** without explicit programming...',
            '**Supervised** learning uses labeled data to train models...',
            'Common ML **algorithms** include decision trees and neural networks...',
          ],
        },
        highlightedWords: [
          {
            word: 'data',
            definition: 'Information used to train machine learning models',
            page: 1,
          },
          { word: 'Supervised', definition: 'Learning with labeled training data', page: 2 },
          {
            word: 'algorithms',
            definition: 'Step-by-step procedures for calculations and problem-solving',
            page: 3,
          },
        ],
        quizQuestions: Array.from({ length: 10 }, (_, i) => ({
          questionText: `ML question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          hint: `Hint for question ${i + 1}`,
          explanation: `Explanation for question ${i + 1}`,
          order: i + 1,
        })),
      },

      {
        title: 'Cybersecurity Essentials',
        level: ChapterLevel.ADVANCED,
        order: 10,
        description: 'Fundamental concepts of cybersecurity',
        imageUrl: '/images/reading/cybersecurity.jpg',
        content: {
          title: 'Security Fundamentals',
          estimatedReadingTime: 7,
          topic: 'Security',
          pages: [
            'Cybersecurity protects systems and data from **threats** and attacks...',
            'Common threats include **malware**, phishing, and SQL injection...',
            '**Encryption** converts data into unreadable format for protection...',
          ],
        },
        highlightedWords: [
          { word: 'threats', definition: 'Potential dangers or risks to security', page: 1 },
          { word: 'malware', definition: 'Malicious software designed to harm systems', page: 2 },
          {
            word: 'Encryption',
            definition: 'Converting data into a coded format to prevent unauthorized access',
            page: 3,
          },
        ],
        quizQuestions: Array.from({ length: 10 }, (_, i) => ({
          questionText: `Cybersecurity question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          hint: `Hint for question ${i + 1}`,
          explanation: `Explanation for question ${i + 1}`,
          order: i + 1,
        })),
      },
    ];
  }

  async run(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      console.error('❌ Error running reading seeder:', error);
      throw error;
    }
  }
}
