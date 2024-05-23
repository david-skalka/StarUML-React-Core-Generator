<h1 align="center">Welcome to StarUML React Core Generator 👋</h1>
<p>
    <img src="https://img.shields.io/badge/staruml-%3E%3D6.0.0-blue.svg" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> An extension for StarUML to generate an fullstack test driven development ready .NET Core React CRUD application from a UML model. Inspired by JHipster and Yellicode bookstore tutorial. Minimalistic intended to modification for your own model driven generator technology.

### 🏠 [Homepage](https://github.com/david-skalka/StarUML-React-Core-Generator)

## Features
- Generate complete application
- Generate integration test
- Generate test data seed using fakerjs
- Generate extra actions from @UMLClass operations (e.g. SQL aggregation actions)
- Simple and modificable
- Robus @UMLModel validation
- Fast template development using Jest runner

## Screencast
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/wPTYLHBJA1Q/0.jpg)](https://www.youtube.com/watch?v=wPTYLHBJA1Q)

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

## Usage
1. Open `test\data\sample.mdj`
2. Change Project name using @UMLModel tag editor
3. Open (`File > Preference > React Core`) and fill Project path
4. Click on the menu (Tools > React Core ) and perform all the steps to generate the entire application
5. Run generated solution in Visual studio

## Example
- `test\data\sample.mdj`

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
