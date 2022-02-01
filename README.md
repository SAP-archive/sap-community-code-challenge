# SAP Community Awareness Code Challenge

<!--- Register repository https://api.reuse.software/register, then add REUSE badge:
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/sap-community-awareness-code-challenge)](https://api.reuse.software/info/github.com/SAP-samples/sap-community-awareness-code-challenge)
-->

[![Visits Badge](https://badges.pufler.dev/visits/SAP-samples/sap-community-awareness-code-challenge)](https://badges.pufler.dev)
[![Updated Badge](https://badges.pufler.dev/updated/SAP-samples/sap-community-awareness-code-challenge)](https://badges.pufler.dev)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/SAP-samples/sap-community-awareness-code-challenge)

[![Contributors Display](https://badges.pufler.dev/contributors/SAP-samples/sap-community-awareness-code-challenge?size=50&padding=5&bots=false)](https://badges.pufler.dev)

The [change log](https://github.com/SAP-samples/sap-community-awareness-code-challenge/blob/main/CHANGELOG.md) describes notable changes in this package.

## Description

SAP Community Awareness Code Challenge: This repository is a template project/solution showing how to enhance your SAP Community profile picture with a new border.

Some of the technology contained within this project:

* [Node.js](https://nodejs.org/en/about/)
* [SAPUI5 Image Editor Control](https://sapui5.hana.ondemand.com/#/entity/sap.suite.ui.commons.imageeditor)
* [Sharp - High performance Node.js image processing](https://github.com/lovell/sharp)
* [SVG Scalable Vector Graphics](https://developer.mozilla.org/en-US/docs/Web/SVG)

## Challenges

Although this project is a complete code sample, it's really only intended to be the starting point. It's part of a code challenge; which means have some fun and learn at the same time.  For the full details on the Code Challenge please see this [SAP Community Discussion Thread](https://groups.community.sap.com/t5/coffee-corner/gh-p/Coffee-Corner). But let's detail right here some of the possible challenges you might undertake using this starting point.

The whole project can run locally. It's a [SAPUI5 app](/profilePic/#profilepic-ui) where you start by uploading the base picture you want.  You can do some editing on it (like I flipped it in the video).  Then you set it to a circular crop (since that's is what the SAP Community profile pic requires).  When you press enhance picture it's uploaded to the "server" there we apply the boarder.  Then you can save the final file (or edit if further if you want). Upon save it automatically opens your SAP Community Profile in another browser tab.  There you can upload your newly enhanced profile picture.  Now that you understand what the code sample does; here are the challenges.

### Run the Project Locally

### Run the Project on the SAP Business Application Studio

### Run the Project in a Dev Container or Codespaces

### Learn about SVG - Change the Enhancement

Create your own profile enhancement. Maybe instead of a board it adds your profile name, badges, etc.

### Port the Whole Project to Another Programming Language

Try and port the whole project to another programming language. I'm sure we will let lots of people converting it to ABAP.

### Multiple Image Enhancement Options in the UI

Extend the app to offer multiple server side enhancements but then extend the SAPUI5 frontend to allow the end user to choose the enhancement type. The trick there is sending the choice along with the upload (it can be done but its tricky). That challenge would be focused on UI5 skills.

## Requirements

Node.js version 12.x, 14.x, or 16.x [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

## Download and Installation

See [Challenges](#challenges)

## Known Issues

None

## How to obtain support

[Create an issue](https://github.com/SAP-samples/sap-community-awareness-code-challenge/issues) in this repository if you find a bug or have questions about the content.

For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing

If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License

Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](https://github.com/SAP-samples/sap-community-awareness-code-challenge/blob/main/LICENSES/Apache-2.0.txt) file.
