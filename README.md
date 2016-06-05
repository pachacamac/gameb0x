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

## Current Games

### Icehockey

A simple realtime icehockey game that works with an arbitrary number of players. As players join and leave, they get assigned in a way to create balanced sized teams. You can shoot goals, block the puck, bounce of the (currently rectangular) rink, and of course punch other players! Score is kept per team and per player.

### Quizbuzzer

A classic quiz show game where you have to answer questions. Like in "Who Wants to Be a Millionaire?" you see a question and get up to four choices. Unlike in the popular TV show this game can be played with as many players as you like. First you only see a buzzer button on your phone and the first who buzzes, then sees the answer buttons and has to choose an answer. A correct answer gives you a point, a wrong answer substracts a point and the other players get a chance.

### ???

Your awesome game idea! Open an issue for a cool idea or implement it and send a pull request! I'd love to see some collaboration here!
