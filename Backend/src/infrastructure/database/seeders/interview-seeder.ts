import { DataSource } from 'typeorm';
import {
  InterviewTopic,
  TopicCategory,
  DifficultyLevel,
} from '../../../domain/entities/interview-topic.entity';
import {
  InterviewQuestion,
  QuestionCategory,
  QuestionDifficulty,
} from '../../../domain/entities/interview-question.entity';

export class InterviewSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    const topicRepository = this.dataSource.getRepository(InterviewTopic);
    const questionRepository = this.dataSource.getRepository(InterviewQuestion);

    console.log('🌱 Seeding interview topics and questions...');

    // Check if data already exists
    const existingTopicsCount = await topicRepository.count();
    if (existingTopicsCount > 0) {
      console.log('✅ Interview data already exists. Skipping seeding.');
      return;
    }

    // ==================== TOPIC 1: JAVASCRIPT ====================
    const jsTopicData = InterviewTopic.createTopic(
      'JavaScript',
      TopicCategory.PROGRAMMING_LANGUAGE,
      DifficultyLevel.INTERMEDIATE,
      'Technical interview focused on JavaScript programming language',
      'javascript',
    );
    jsTopicData.order = 1;
    jsTopicData.estimatedDurationMinutes = 8;

    const jsTopic = await topicRepository.save(jsTopicData);

    const jsQuestions = [
      {
        question: 'What is JavaScript and what are its main characteristics?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.EASY,
        sampleAnswers: [
          'JavaScript is a high-level programming language primarily used for web development. It is dynamically typed, supports object-oriented and functional programming paradigms, and runs in browsers as well as servers via Node.js.',
          'JavaScript is a scripting language that makes web pages interactive. It can manipulate the DOM, handle events, and communicate with servers asynchronously using AJAX or Fetch API.',
        ],
        keywords: [
          'programming language',
          'web development',
          'dynamic',
          'browser',
          'Node.js',
          'interpreted',
        ],
        minimumAnswerLength: 80,
        recommendedTimeSeconds: 90,
        order: 1,
      },
      {
        question: 'Can you explain the difference between var, let, and const in JavaScript?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'var is function-scoped and can be redeclared. let is block-scoped and cannot be redeclared in the same scope. const is also block-scoped but creates a read-only reference, meaning you cannot reassign the variable.',
          'The main differences are scoping and mutability. var has function scope and is hoisted, let and const have block scope. const is immutable for primitive values but objects assigned to const can still be modified.',
        ],
        keywords: [
          'scope',
          'block-scoped',
          'function-scoped',
          'hoisting',
          'immutable',
          'redeclare',
        ],
        minimumAnswerLength: 70,
        recommendedTimeSeconds: 120,
        order: 2,
      },
      {
        question:
          'Have you worked on any JavaScript projects? What challenges did you face?',
        category: QuestionCategory.EXPERIENCE,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'Yes, I built a real-time chat application using Node.js and Socket.io. The main challenge was handling concurrent connections and ensuring messages were delivered in the correct order.',
          'I developed a single-page application using React. One challenge was managing state across multiple components, which I solved by implementing Redux for centralized state management.',
        ],
        keywords: [
          'project',
          'built',
          'developed',
          'challenge',
          'solution',
          'learned',
          'experience',
        ],
        minimumAnswerLength: 100,
        recommendedTimeSeconds: 150,
        order: 3,
      },
      {
        question:
          'What would you do if your JavaScript application suddenly starts running very slowly in production?',
        category: QuestionCategory.DECISION,
        difficulty: QuestionDifficulty.HARD,
        sampleAnswers: [
          'First, I would check the browser console and network tab for errors or slow requests. Then, I would use profiling tools like Chrome DevTools to identify performance bottlenecks. I would also check if there are memory leaks or excessive DOM manipulations.',
          'I would start by monitoring application metrics to identify the issue. I would check for infinite loops, unnecessary re-renders, or large data processing in the main thread. I might implement code splitting or lazy loading to improve performance.',
        ],
        keywords: [
          'debug',
          'performance',
          'profiling',
          'optimization',
          'monitor',
          'investigate',
          'analyze',
        ],
        minimumAnswerLength: 120,
        recommendedTimeSeconds: 180,
        order: 4,
      },
      {
        question: 'Describe a situation where you had to debug a complex JavaScript issue.',
        category: QuestionCategory.BEHAVIORAL,
        difficulty: QuestionDifficulty.HARD,
        sampleAnswers: [
          'I encountered a race condition in an asynchronous function that caused inconsistent data updates. I used console logging and async/await patterns to trace the execution flow, eventually implementing proper promise chaining and error handling to resolve it.',
          'There was a memory leak in our application causing the browser to crash. I used Chrome DevTools memory profiler to identify that event listeners were not being properly removed. I refactored the code to use proper cleanup in useEffect hooks.',
        ],
        keywords: [
          'debug',
          'issue',
          'problem',
          'solved',
          'fixed',
          'analyzed',
          'traced',
          'identified',
        ],
        minimumAnswerLength: 100,
        recommendedTimeSeconds: 150,
        order: 5,
      },
    ];

    for (const qData of jsQuestions) {
      const question = InterviewQuestion.createQuestion(
        jsTopic.id,
        qData.question,
        qData.category,
        qData.difficulty,
        qData.sampleAnswers,
      );
      question.keywords = qData.keywords;
      question.minimumAnswerLength = qData.minimumAnswerLength;
      question.recommendedTimeSeconds = qData.recommendedTimeSeconds;
      question.order = qData.order;
      await questionRepository.save(question);
    }

    console.log('✅ JavaScript topic and questions seeded');

    // ==================== TOPIC 2: PYTHON ====================
    const pyTopicData = InterviewTopic.createTopic(
      'Python',
      TopicCategory.PROGRAMMING_LANGUAGE,
      DifficultyLevel.INTERMEDIATE,
      'Technical interview focused on Python programming language',
      'python',
    );
    pyTopicData.order = 2;
    pyTopicData.estimatedDurationMinutes = 8;

    const pyTopic = await topicRepository.save(pyTopicData);

    const pyQuestions = [
      {
        question: 'What is Python and why is it popular for data science and web development?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.EASY,
        sampleAnswers: [
          'Python is a high-level, interpreted programming language known for its simple and readable syntax. It is popular in data science due to libraries like NumPy, Pandas, and scikit-learn, and in web development with frameworks like Django and Flask.',
          'Python is an easy-to-learn language with extensive libraries for various domains. Its readability and versatility make it ideal for rapid prototyping, data analysis, machine learning, and building web applications.',
        ],
        keywords: [
          'interpreted',
          'readable',
          'libraries',
          'data science',
          'web development',
          'versatile',
        ],
        minimumAnswerLength: 80,
        recommendedTimeSeconds: 90,
        order: 1,
      },
      {
        question: 'Can you explain the difference between lists and tuples in Python?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'Lists are mutable, meaning you can modify their contents after creation, while tuples are immutable. Lists use square brackets, tuples use parentheses. Tuples are generally faster and can be used as dictionary keys.',
          'The main difference is mutability. Lists can be changed, appended, or modified, whereas tuples cannot be altered once created. Tuples are often used for data that should not change, like coordinates or database records.',
        ],
        keywords: [
          'mutable',
          'immutable',
          'list',
          'tuple',
          'brackets',
          'parentheses',
          'performance',
        ],
        minimumAnswerLength: 70,
        recommendedTimeSeconds: 120,
        order: 2,
      },
      {
        question: 'Have you built any Python applications? What libraries did you use?',
        category: QuestionCategory.EXPERIENCE,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'I built a machine learning model for predicting house prices using Pandas for data manipulation, scikit-learn for modeling, and Matplotlib for visualization. I also deployed it using Flask as a REST API.',
          'I developed a web scraping tool using BeautifulSoup and Requests to collect data from multiple websites. I then processed the data with Pandas and stored it in a PostgreSQL database using SQLAlchemy.',
        ],
        keywords: [
          'project',
          'application',
          'libraries',
          'Pandas',
          'Flask',
          'Django',
          'built',
          'developed',
        ],
        minimumAnswerLength: 100,
        recommendedTimeSeconds: 150,
        order: 3,
      },
      {
        question:
          'What would you do if your Python script is consuming too much memory?',
        category: QuestionCategory.DECISION,
        difficulty: QuestionDifficulty.HARD,
        sampleAnswers: [
          'I would profile the script using tools like memory_profiler to identify which parts consume the most memory. Then I would optimize data structures, use generators instead of lists where possible, and process data in chunks rather than loading everything into memory.',
          'First, I would check for memory leaks or unnecessary data retention. I would use del statements to free up memory, implement pagination for large datasets, and consider using more efficient data structures like NumPy arrays instead of Python lists.',
        ],
        keywords: [
          'memory',
          'optimize',
          'profiling',
          'generators',
          'chunks',
          'efficient',
          'data structures',
        ],
        minimumAnswerLength: 120,
        recommendedTimeSeconds: 180,
        order: 4,
      },
      {
        question: 'Tell me about a time when you had to learn a new Python framework quickly.',
        category: QuestionCategory.BEHAVIORAL,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'I had to learn FastAPI for a new project with a tight deadline. I read the official documentation, watched tutorial videos, and built a small prototype to understand the key concepts. Within a week, I was able to develop a functional API.',
          'I needed to learn Django on short notice for a client project. I took an online course, studied existing Django codebases, and asked colleagues for help. By breaking down the learning into small tasks, I became productive within two weeks.',
        ],
        keywords: [
          'learned',
          'framework',
          'quickly',
          'documentation',
          'practice',
          'prototype',
          'deadline',
        ],
        minimumAnswerLength: 100,
        recommendedTimeSeconds: 150,
        order: 5,
      },
    ];

    for (const qData of pyQuestions) {
      const question = InterviewQuestion.createQuestion(
        pyTopic.id,
        qData.question,
        qData.category,
        qData.difficulty,
        qData.sampleAnswers,
      );
      question.keywords = qData.keywords;
      question.minimumAnswerLength = qData.minimumAnswerLength;
      question.recommendedTimeSeconds = qData.recommendedTimeSeconds;
      question.order = qData.order;
      await questionRepository.save(question);
    }

    console.log('✅ Python topic and questions seeded');

    // ==================== TOPIC 3: DATABASES (PostgreSQL/MySQL) ====================
    const dbTopicData = InterviewTopic.createTopic(
      'Databases',
      TopicCategory.DATABASE,
      DifficultyLevel.INTERMEDIATE,
      'Technical interview focused on database management and SQL',
      'database',
    );
    dbTopicData.order = 3;
    dbTopicData.estimatedDurationMinutes = 7;

    const dbTopic = await topicRepository.save(dbTopicData);

    const dbQuestions = [
      {
        question: 'What is a database and what are the differences between SQL and NoSQL databases?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.EASY,
        sampleAnswers: [
          'A database is an organized collection of structured data. SQL databases are relational, using tables with predefined schemas, while NoSQL databases are non-relational and can store unstructured or semi-structured data with flexible schemas.',
          'Databases store and manage data efficiently. SQL databases like PostgreSQL and MySQL use structured query language and are best for complex queries. NoSQL databases like MongoDB are better for large-scale, distributed data with varying structures.',
        ],
        keywords: [
          'database',
          'SQL',
          'NoSQL',
          'relational',
          'schema',
          'structured',
          'tables',
        ],
        minimumAnswerLength: 80,
        recommendedTimeSeconds: 90,
        order: 1,
      },
      {
        question: 'Can you explain what database indexes are and why they are important?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'Indexes are data structures that improve the speed of data retrieval operations on a database table. They work like a book index, allowing the database to find rows quickly without scanning the entire table. However, they can slow down write operations.',
          'An index creates a sorted copy of specific columns to speed up queries. For example, indexing a user email column makes lookups faster. The trade-off is that indexes consume storage space and can slow down inserts and updates.',
        ],
        keywords: [
          'index',
          'performance',
          'query',
          'speed',
          'retrieval',
          'optimization',
          'trade-off',
        ],
        minimumAnswerLength: 70,
        recommendedTimeSeconds: 120,
        order: 2,
      },
      {
        question: 'Have you worked with databases in your projects? What was your experience?',
        category: QuestionCategory.EXPERIENCE,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'Yes, I designed a PostgreSQL database for an e-commerce platform with tables for users, products, orders, and payments. I implemented foreign keys for referential integrity and created indexes on frequently queried columns.',
          'I worked with MongoDB for a social media application where we stored user posts and comments. The flexible schema allowed us to easily add new fields without migrations, which was very helpful for rapid development.',
        ],
        keywords: [
          'designed',
          'implemented',
          'database',
          'tables',
          'schema',
          'queries',
          'experience',
        ],
        minimumAnswerLength: 100,
        recommendedTimeSeconds: 150,
        order: 3,
      },
      {
        question:
          'What would you do if a database query is running too slowly and affecting application performance?',
        category: QuestionCategory.DECISION,
        difficulty: QuestionDifficulty.HARD,
        sampleAnswers: [
          'I would first analyze the query execution plan using EXPLAIN to identify bottlenecks. Then I would check if indexes are missing or if the query can be optimized. If needed, I would consider query caching, database replication, or partitioning large tables.',
          'I would examine slow query logs to identify the problematic query. I would look for missing indexes, unnecessary joins, or full table scans. I might rewrite the query for better performance, add appropriate indexes, or implement database caching strategies.',
        ],
        keywords: [
          'optimize',
          'query',
          'performance',
          'indexes',
          'EXPLAIN',
          'bottleneck',
          'analyze',
        ],
        minimumAnswerLength: 120,
        recommendedTimeSeconds: 180,
        order: 4,
      },
    ];

    for (const qData of dbQuestions) {
      const question = InterviewQuestion.createQuestion(
        dbTopic.id,
        qData.question,
        qData.category,
        qData.difficulty,
        qData.sampleAnswers,
      );
      question.keywords = qData.keywords;
      question.minimumAnswerLength = qData.minimumAnswerLength;
      question.recommendedTimeSeconds = qData.recommendedTimeSeconds;
      question.order = qData.order;
      await questionRepository.save(question);
    }

    console.log('✅ Databases topic and questions seeded');

    // ==================== TOPIC 4: CLOUD INFRASTRUCTURE (AWS/Azure) ====================
    const cloudTopicData = InterviewTopic.createTopic(
      'Cloud Infrastructure',
      TopicCategory.INFRASTRUCTURE,
      DifficultyLevel.ADVANCED,
      'Technical interview focused on cloud computing and infrastructure management',
      'cloud',
    );
    cloudTopicData.order = 4;
    cloudTopicData.estimatedDurationMinutes = 10;

    const cloudTopic = await topicRepository.save(cloudTopicData);

    const cloudQuestions = [
      {
        question: 'What is cloud computing and what are its main service models?',
        category: QuestionCategory.CONCEPTUAL,
        difficulty: QuestionDifficulty.EASY,
        sampleAnswers: [
          'Cloud computing is the delivery of computing services over the internet. The main service models are IaaS (Infrastructure as a Service), PaaS (Platform as a Service), and SaaS (Software as a Service). Each provides different levels of abstraction and management.',
          'Cloud computing allows users to access computing resources on-demand without owning physical infrastructure. IaaS provides virtual machines, PaaS offers development platforms, and SaaS delivers complete applications like Gmail or Salesforce.',
        ],
        keywords: [
          'cloud',
          'IaaS',
          'PaaS',
          'SaaS',
          'internet',
          'on-demand',
          'services',
        ],
        minimumAnswerLength: 80,
        recommendedTimeSeconds: 90,
        order: 1,
      },
      {
        question: 'Have you deployed applications to cloud platforms? Which one and what was the process?',
        category: QuestionCategory.EXPERIENCE,
        difficulty: QuestionDifficulty.MEDIUM,
        sampleAnswers: [
          'Yes, I deployed a web application to AWS using EC2 instances for compute, RDS for the database, and S3 for static files. I configured security groups, set up load balancers, and automated deployment using CI/CD pipelines with GitHub Actions.',
          'I deployed a microservices application to Azure using Azure Kubernetes Service. I containerized the services with Docker, configured Azure DevOps for CI/CD, and used Azure Monitor for logging and performance tracking.',
        ],
        keywords: [
          'deployed',
          'cloud',
          'AWS',
          'Azure',
          'EC2',
          'Kubernetes',
          'CI/CD',
          'automation',
        ],
        minimumAnswerLength: 100,
        recommendedTimeSeconds: 150,
        order: 2,
      },
      {
        question:
          'What would you do if your cloud infrastructure costs are unexpectedly high?',
        category: QuestionCategory.DECISION,
        difficulty: QuestionDifficulty.HARD,
        sampleAnswers: [
          'I would first analyze the billing dashboard to identify which services are consuming the most resources. Then I would look for idle resources, oversized instances, or unnecessary data transfer. I would implement auto-scaling, use reserved instances, and set up cost alerts.',
          'I would review the cost breakdown by service and region. I would check for zombie resources, optimize storage by moving infrequently accessed data to cheaper tiers, and consider using spot instances for non-critical workloads. I would also implement proper tagging for better cost allocation.',
        ],
        keywords: [
          'cost',
          'optimize',
          'billing',
          'resources',
          'analyze',
          'auto-scaling',
          'reserved instances',
        ],
        minimumAnswerLength: 120,
        recommendedTimeSeconds: 180,
        order: 3,
      },
    ];

    for (const qData of cloudQuestions) {
      const question = InterviewQuestion.createQuestion(
        cloudTopic.id,
        qData.question,
        qData.category,
        qData.difficulty,
        qData.sampleAnswers,
      );
      question.keywords = qData.keywords;
      question.minimumAnswerLength = qData.minimumAnswerLength;
      question.recommendedTimeSeconds = qData.recommendedTimeSeconds;
      question.order = qData.order;
      await questionRepository.save(question);
    }

    console.log('✅ Cloud Infrastructure topic and questions seeded');

    console.log('🎉 Interview seeding completed successfully!');
    console.log(`   - 4 topics created`);
    console.log(`   - ${jsQuestions.length + pyQuestions.length + dbQuestions.length + cloudQuestions.length} questions created`);
  }
}

// Export a function to run the seeder
export async function seedInterviews(dataSource: DataSource): Promise<void> {
  const seeder = new InterviewSeeder(dataSource);
  await seeder.seed();
}
