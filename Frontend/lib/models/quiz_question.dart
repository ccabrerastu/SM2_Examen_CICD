class QuizQuestion {
  final String question;
  final List<String> options;
  final int correctAnswer;
  final String category;
  final int id;

  const QuizQuestion({
    required this.question,
    required this.options,
    required this.correctAnswer,
    required this.category,
    required this.id,
  });

  static List<QuizQuestion> getSampleQuestions() {
    return [
      // NETWORKING QUESTIONS
      QuizQuestion(
        id: 1,
        question: "What is an IP address?",
        options: [
          "A) A unique identifier for a computer or device on a network.",
          "B) A programming language used to develop applications.",
          "C) A physical component of a computer like RAM or CPU.",
          "D) A protocol used to send emails.",
        ],
        correctAnswer: 0,
        category: "Network",
      ),
      QuizQuestion(
        id: 2,
        question: "What does HTTP stand for?",
        options: [
          "A) HyperText Transfer Protocol",
          "B) High Technology Transfer Process",
          "C) Hardware Text Transmission Protocol",
          "D) Home Terminal Transfer Program",
        ],
        correctAnswer: 0,
        category: "Network",
      ),
      QuizQuestion(
        id: 3,
        question: "What is the purpose of DNS?",
        options: [
          "A) To encrypt network traffic",
          "B) To translate domain names to IP addresses",
          "C) To compress data packets",
          "D) To monitor network performance",
        ],
        correctAnswer: 1,
        category: "Network",
      ),
      QuizQuestion(
        id: 4,
        question: "Which port is commonly used for HTTPS?",
        options: [
          "A) Port 80",
          "B) Port 443",
          "C) Port 21",
          "D) Port 25",
        ],
        correctAnswer: 1,
        category: "Network",
      ),
      
      // PROGRAMMING QUESTIONS
      QuizQuestion(
        id: 5,
        question: "What does API stand for?",
        options: [
          "A) Application Programming Interface",
          "B) Advanced Programming Integration",
          "C) Automated Process Integration",
          "D) Application Process Interface",
        ],
        correctAnswer: 0,
        category: "Programming",
      ),
      QuizQuestion(
        id: 6,
        question: "What is a variable in programming?",
        options: [
          "A) A fixed value that never changes",
          "B) A container that stores data values",
          "C) A type of programming language",
          "D) A debugging tool",
        ],
        correctAnswer: 1,
        category: "Programming",
      ),
      QuizQuestion(
        id: 7,
        question: "What does OOP stand for?",
        options: [
          "A) Object-Oriented Programming",
          "B) Open Operating Platform",
          "C) Optimized Output Process",
          "D) Online Operation Protocol",
        ],
        correctAnswer: 0,
        category: "Programming",
      ),
      QuizQuestion(
        id: 8,
        question: "What is a function in programming?",
        options: [
          "A) A type of variable",
          "B) A reusable block of code that performs a specific task",
          "C) A programming language",
          "D) A computer component",
        ],
        correctAnswer: 1,
        category: "Programming",
      ),
      QuizQuestion(
        id: 9,
        question: "What is debugging?",
        options: [
          "A) Writing new code",
          "B) The process of finding and fixing errors in code",
          "C) Deleting old files",
          "D) Installing software",
        ],
        correctAnswer: 1,
        category: "Programming",
      ),
      
      // DATABASE QUESTIONS
      QuizQuestion(
        id: 10,
        question: "What does SQL stand for?",
        options: [
          "A) Structured Query Language",
          "B) Simple Question Logic",
          "C) System Quality Level",
          "D) Software Query Library",
        ],
        correctAnswer: 0,
        category: "Database",
      ),
      QuizQuestion(
        id: 11,
        question: "What is a database schema?",
        options: [
          "A) A backup of the database",
          "B) The structure that defines database organization",
          "C) A type of database software",
          "D) A database security protocol",
        ],
        correctAnswer: 1,
        category: "Database",
      ),
      QuizQuestion(
        id: 12,
        question: "What is a primary key in a database?",
        options: [
          "A) The most important table",
          "B) A unique identifier for each record in a table",
          "C) The first column in a table",
          "D) A password for database access",
        ],
        correctAnswer: 1,
        category: "Database",
      ),
      QuizQuestion(
        id: 13,
        question: "What does CRUD stand for in database operations?",
        options: [
          "A) Create, Read, Update, Delete",
          "B) Copy, Remove, Upload, Download",
          "C) Connect, Run, Use, Disconnect",
          "D) Code, Review, Update, Deploy",
        ],
        correctAnswer: 0,
        category: "Database",
      ),
      
      // SECURITY QUESTIONS
      QuizQuestion(
        id: 14,
        question: "What is encryption?",
        options: [
          "A) Deleting sensitive data",
          "B) The process of converting data into a coded format",
          "C) Backing up files",
          "D) Installing antivirus software",
        ],
        correctAnswer: 1,
        category: "Security",
      ),
      QuizQuestion(
        id: 15,
        question: "What is a firewall?",
        options: [
          "A) A type of computer virus",
          "B) A security system that monitors network traffic",
          "C) A backup storage device",
          "D) A programming language",
        ],
        correctAnswer: 1,
        category: "Security",
      ),
      QuizQuestion(
        id: 16,
        question: "What does SSL stand for?",
        options: [
          "A) Secure Socket Layer",
          "B) System Security Level",
          "C) Software Safety Lock",
          "D) Server Side Language",
        ],
        correctAnswer: 0,
        category: "Security",
      ),
      
      // DEVOPS QUESTIONS
      QuizQuestion(
        id: 17,
        question: "What is CI/CD?",
        options: [
          "A) Computer Integration/Code Development",
          "B) Continuous Integration/Continuous Deployment",
          "C) Code Inspection/Code Documentation",
          "D) Central Intelligence/Central Database",
        ],
        correctAnswer: 1,
        category: "DevOps",
      ),
      QuizQuestion(
        id: 18,
        question: "What is a container in software development?",
        options: [
          "A) A storage device for code",
          "B) A lightweight, portable package that includes everything needed to run an application",
          "C) A type of database",
          "D) A programming framework",
        ],
        correctAnswer: 1,
        category: "DevOps",
      ),
      QuizQuestion(
        id: 19,
        question: "What does Docker do?",
        options: [
          "A) Edits code automatically",
          "B) Creates and manages containers",
          "C) Designs user interfaces",
          "D) Monitors network traffic",
        ],
        correctAnswer: 1,
        category: "DevOps",
      ),
      
      // WEB DEVELOPMENT QUESTIONS
      QuizQuestion(
        id: 20,
        question: "What does HTML stand for?",
        options: [
          "A) HyperText Markup Language",
          "B) High Technology Modern Language",
          "C) Home Tool Management Language",
          "D) Hardware Text Management Logic",
        ],
        correctAnswer: 0,
        category: "Web Development",
      ),
      QuizQuestion(
        id: 21,
        question: "What is CSS used for?",
        options: [
          "A) Creating databases",
          "B) Styling and formatting web pages",
          "C) Writing server-side logic",
          "D) Managing file systems",
        ],
        correctAnswer: 1,
        category: "Web Development",
      ),
      QuizQuestion(
        id: 22,
        question: "What is a REST API?",
        options: [
          "A) A type of database",
          "B) An architectural style for web services",
          "C) A programming language",
          "D) A security protocol",
        ],
        correctAnswer: 1,
        category: "Web Development",
      ),
      QuizQuestion(
        id: 23,
        question: "What does JSON stand for?",
        options: [
          "A) JavaScript Object Notation",
          "B) Java System Object Network",
          "C) Just Simple Object Names",
          "D) Joint Software Object Navigation",
        ],
        correctAnswer: 0,
        category: "Web Development",
      ),
      
      // SYSTEM ADMINISTRATION QUESTIONS
      QuizQuestion(
        id: 24,
        question: "What is a virtual machine?",
        options: [
          "A) A physical computer",
          "B) A software emulation of a computer system",
          "C) A type of programming language",
          "D) A network protocol",
        ],
        correctAnswer: 1,
        category: "System Administration",
      ),
      QuizQuestion(
        id: 25,
        question: "What does RAM stand for?",
        options: [
          "A) Random Access Memory",
          "B) Rapid Application Management",
          "C) Remote Access Module",
          "D) Real-time Application Monitor",
        ],
        correctAnswer: 0,
        category: "System Administration",
      ),
    ];
  }
}