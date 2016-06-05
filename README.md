# gameb0x

This project aims to deliver a pleasant casual local multiplayer gaming- and development experience.

## Basic Idea

The idea is simple (and not new of course):

1. You start the local server on your computer
2. Open your browser on the same computer
3. Select a game and select "game-screen"
4. Open the same page on a smartphone or tablet
5. Select the same game and select "controller"
6. Repeat steps 4 and 5 on multiple smartphones
7. Enjoy a local multiplayer game!

Smartphones act as controllers and the PC or laptop acts as the game screen.

## Concept

* The games are written in JavaScript/HTML/CSS and run in the browser
* The controllers are written in JavaScript/HTML/CSS and run in the browser
* Game and controllers communicate via WebSocket (later maybe WebRTC?) over a simple publish subscribe server
* The games are meant to be casual. That means:
  * Easy to learn
  * Easy to play
  * Not time intensive
  * Preferably allow virtually unlimited players to join/leave whenever they want

## Setup

If you don't have a recent Ruby installation (2.0 or higher)

* follow instructions on https://rvm.io/rvm/install
* rvm install ruby
* gem install bundler

Now run

* bundle install
* ruby server.rb
* open browser at http://localhost:8888
