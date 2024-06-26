<h1 align="center">Welcome to StarUML React Core Generator 👋</h1>
<p>
    <img src="https://img.shields.io/badge/staruml-%3E%3D6.0.0-blue.svg" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> An extension for StarUML that generates a full-stack, test-driven development-ready .NET Core React CRUD application from a UML model. Inspired by the JHipster and Yellicode bookstore tutorial, it is minimalistic and intended to be modified for your own model-driven generator technology.

### 🏠 [Homepage](https://github.com/david-skalka/StarUML-React-Core-Generator)

## Motivation

Model-Driven Development (MDD) generators enhance productivity, improve code quality, and foster better collaboration and communication. By leveraging MDD generators, development speed can be accelerated by 2 to 5 times or more compared to traditional software development approaches.

### Benefits of Custom Code Generator
- Tailored Solutions: Custom code generators can be tailored specifically to the needs of a particular project or organization, providing greater flexibility and customization options.
- Optimized Code: With custom code generators, developers have more control over the generated code, allowing for optimization of performance, scalability, and maintainability based on project requirements.
- Integration with Existing Systems: Custom code generators can be seamlessly integrated with existing systems, ensuring smoother transitions and better compatibility with legacy infrastructure.

## Screencast
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/wPTYLHBJA1Q/0.jpg)](https://www.youtube.com/watch?v=wPTYLHBJA1Q)

## Features
- Generate complete application.
- Generate integration tests.
- Generate test data seeds using Faker.js.
- Generate extra actions from @UMLClass operations (e.g., SQL aggregation actions).
- Simple and modifiable.
- Robust @UMLModel validation.
- Fast template development using Jest runner.

## Primitive types
- Integer
- Text
- Decimal
- DateTime
- Bool

## Prerequisites

- staruml >=6.0.0
- net6.0 ( Core )
- Imported `assets\Profile.mfj` for new project ( The sample already has an imported profile )

## Install
1- Install **StarUML**,  [download page](http://staruml.io/download).

2- Download last release build

3- Unzip to StarUML extension user folder.

- Windows: `C:\Users\<user>\AppData\Roaming\StarUML\extensions\user\staruml-react-core-generator`

## Example
1. Open `test\data\sample.mdj`
2. Change Project name using @UMLModel tag editor
3. Open (`File > Preference > React Core`) and fill Project path
4. Click on the menu (Tools > React Core ) and perform all the steps to generate the entire application
5. Run generated solution in Visual studio


## Usage
  <details>
    <summary>Define the Domain Model Using a Class Diagram</summary>
    Identify Main Data Entities: Extract key entities (e.g., users, products, orders) from the business specifications.
    Understand Attributes and Relationships: Analyze their attributes, relationships, and necessary operations.
    Add stereotypes to @UMLModel ( ReactCoreGen ), @UmlClass ( Entity ), Attributes ( Field ). Fill in their tags accordingly.
  </details>
  <details>
    <summary>Initialize the Project</summary>
    Generate the Application: Navigate to the menu (Tools > React Core) and follow the steps to generate the entire application.
  </details>
  <details>
    <summary>Customization</summary>
    Create Prototype: Focus on entity relationships and validate them. Specify Action Behavior: Customize the specified actions, then make minor UI changes. Code Merging: Be cautious with full customizations before modifying the UML model.
  </details>
  <details>
  <summary>Continuous Application Updates</summary>
    Version Control: Utilize version control systems to merge new UML model changes into the customized application.
  </details>
  <details>
    <summary>Test-Driven Development (TDD)</summary>
    Utilize execution tests to customize API actions instead of using Swagger UI or the React client. For insights into the TDD application, refer to the test coverage report, which provides valuable information about the application's architecture and its test cases.
    Benefits: TDD facilitates faster development and enhances code quality by making refactoring easier. It ensures that bugs are detected and resolved early, resulting in a more robust and maintainable codebase.
  </details>
    

<details>
  <summary>Deploying the Application Using Continuous Deployment (CD)</summary>
Test Execution: It is critical to execute tests using a continuous integration server (e.g., GitHub Actions) to ensure all tests in the repository pass. Disable application deployment unless all tests succeed.
    </details>



    








## Roadmap
- Many to many relation

## How to modify
1. Copy `C:\Users\<user>\AppData\Roaming\StarUML\extensions\user\staruml-react-core-generator` to custom folder
2. Open in VS code
3. `npm run export-metadata` for save sample.mdj as sample.json
4. Execute ejs template by `test\render-templates.test.js` using Jest test runner and check output of template in console

## Author

👤 **David Skalka**


## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
