# Firebase Functions Sample 1

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deploy](#deploy)
- [Contributing](../CONTRIBUTING.md)

## About <a name = "about"></a>

Write about 1-2 paragraphs describing the purpose of your project.

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

```
npm install firebase-admin --save
```

## Deployment <a name = "deploy"></a>

```
firebase deploy --only functions

firebase deploy --only "functions:getArticles,functions:helloWorld"
```

### env.ts

```
const querystring = require("querystring");

export const environ: any = {
  password: querystring.stringify("put-your-password-here"),
};
```
